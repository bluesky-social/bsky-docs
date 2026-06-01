/**
 * Lexicon -> OpenAPI converter.
 *
 * Node/TS port of the original Deno `atproto-openapi-types/main.ts`. Reads the
 * lexicon JSON installed by `@atproto/lex` (`lexicons/**​/*.json`), converts each
 * query/procedure into an OpenAPI path and each schema def into a component, and
 * writes `openapi.json`. The rendered reference (Scalar) consumes that file.
 */
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import fg from "fast-glob";
import type { OpenAPIV3_1 } from "openapi-types";

import { calculateTag, loadLexicon } from "./lib/utils";
import {
  convertArray,
  convertObject,
  convertProcedure,
  convertQuery,
  convertRecord,
  convertString,
  convertToken,
} from "./lib/converters/mod";
import {
  INCLUDE_PREFIXES,
  NAMESPACE_ORDER,
  descriptionPrefixFor,
} from "../endpoints.config";

const LEXICONS_DIR = resolve(process.cwd(), "lexicons");
const OUTPUT = resolve(process.cwd(), "openapi.json");

const paths: OpenAPIV3_1.PathsObject = {};
const components: OpenAPIV3_1.ComponentsObject = {
  schemas: {},
  securitySchemes: {
    Bearer: { type: "http", scheme: "bearer" },
  },
};
const tagNames = new Set<string>();

/** Flag a (non-`$ref`) component schema as deprecated, in place. */
function markDeprecated(
  schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
  deprecated: boolean,
): OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject {
  if (deprecated && schema && !("$ref" in schema)) {
    (schema as OpenAPIV3_1.SchemaObject).deprecated = true;
  }
  return schema;
}

/** Order tags by NAMESPACE_ORDER first, then alphabetically. */
function namespaceRank(id: string): number {
  const i = NAMESPACE_ORDER.findIndex((p) => id.startsWith(p));
  return i === -1 ? NAMESPACE_ORDER.length : i;
}

function sortedTags(): string[] {
  return Array.from(tagNames).sort((a, b) => {
    const ra = namespaceRank(a);
    const rb = namespaceRank(b);
    return ra !== rb ? ra - rb : a.localeCompare(b);
  });
}

/** Build Scalar/Redoc `x-tagGroups` so app.bsky.* and com.atproto.* lead. */
function tagGroups(tags: string[]): { name: string; tags: string[] }[] {
  const groups: { name: string; tags: string[] }[] = [];
  const used = new Set<string>();

  for (const prefix of NAMESPACE_ORDER) {
    const name = prefix.replace(/\.$/, "");
    const groupTags = tags.filter((t) => t.startsWith(prefix));
    groupTags.forEach((t) => used.add(t));
    if (groupTags.length) groups.push({ name, tags: groupTags });
  }

  const other = tags.filter((t) => !used.has(t));
  if (other.length) groups.push({ name: "Other", tags: other });

  return groups;
}

async function main() {
  const entries = await fg("**/*.json", {
    cwd: LEXICONS_DIR,
    absolute: true,
  });

  if (entries.length === 0) {
    throw new Error(
      `No lexicon JSON found in ${LEXICONS_DIR}. Run \`npm run install-lexicons\` first.`,
    );
  }

  for (const entry of entries.sort()) {
    const doc = await loadLexicon(entry);
    const id = doc.id;
    const defs = doc.defs as Record<string, any>;

    // Endpoints are only emitted for the curated namespaces. Schemas (defs)
    // outside them may still be present as transitive `$ref` targets — those
    // become components but never get a path or a sidebar tag.
    const isEndpointNamespace = INCLUDE_PREFIXES.some((p) => id.startsWith(p));

    for (const [name, def] of Object.entries(defs)) {
      const identifier = name === "main" ? id : `${id}.${name}`;
      const isEndpoint = def.type === "query" || def.type === "procedure";

      const containsUnspecced =
        identifier.toLowerCase().includes("unspecced") ||
        identifier.toLowerCase().includes(".temp.");
      const isDeprecated =
        def.description?.toLowerCase().startsWith("deprecated") ?? false;

      // Endpoints: skip unspecced/temp/deprecated entirely — we don't want cards
      // for them. Schema defs: always emit, because they may be `$ref` targets;
      // dropping a referenced schema would leave a dangling pointer. Deprecated
      // schema defs are emitted but flagged via `deprecated: true`.
      if (isEndpoint && (containsUnspecced || isDeprecated)) {
        continue;
      }

      const prefix = descriptionPrefixFor(id);

      switch (def.type) {
        case "array":
          components.schemas![identifier] = markDeprecated(
            convertArray(id, name, def),
            isDeprecated,
          );
          break;
        case "object":
          components.schemas![identifier] = markDeprecated(
            convertObject(id, name, def),
            isDeprecated,
          );
          break;
        case "procedure": {
          if (!isEndpointNamespace) break;
          const post = convertProcedure(id, name, def);
          if (post) {
            post.description = post.description
              ? `${prefix}\n\n${def.description}`
              : prefix;
            // @ts-ignore method-keyed PathItem
            paths[`/xrpc/${id}`] = { post };
            tagNames.add(calculateTag(id));
          }
          break;
        }
        case "query": {
          if (!isEndpointNamespace) break;
          const get = convertQuery(id, name, def);
          if (get) {
            get.description = def.description
              ? `${prefix}\n\n${def.description}`
              : prefix;
            // @ts-ignore method-keyed PathItem
            paths[`/xrpc/${id}`] = { get };
            tagNames.add(calculateTag(id));
          }
          break;
        }
        case "record":
          components.schemas![identifier] = markDeprecated(
            convertRecord(id, name, def),
            isDeprecated,
          );
          break;
        case "string":
          components.schemas![identifier] = markDeprecated(
            convertString(id, name, def),
            isDeprecated,
          );
          break;
        case "subscription":
          // Event-stream subscriptions can't be represented in OpenAPI; skip.
          break;
        case "permission-set":
          // No OpenAPI representation; skip.
          break;
        case "token":
          components.schemas![identifier] = markDeprecated(
            convertToken(id, name, def),
            isDeprecated,
          );
          break;
        default:
          throw new Error(`Unknown type: ${def.type} (${identifier})`);
      }
    }
  }

  const tags = sortedTags();

  const api: OpenAPIV3_1.Document & { "x-tagGroups"?: unknown } = {
    openapi: "3.1.0",
    info: {
      title: "Bluesky HTTP API Reference",
      summary: "HTTP/XRPC endpoint reference for Bluesky and AT Protocol lexicons.",
      description:
        "This is the HTTP API reference for Bluesky and the AT Protocol, covering the " +
        "`app.bsky.*`, `com.atproto.*`, `chat.bsky.*`, and `tools.ozone.*` namespaces.\n\n" +
        "Many endpoints are public and require no authentication; others require a bearer " +
        "token (use **Authorize** to add one — e.g. for authenticated reads or write " +
        "requests). The per-endpoint notes describe where requests should be sent and how " +
        "authentication and service proxying work.\n\n" +
        "For client libraries, see the [AT Protocol SDKs](https://atproto.com/sdks).",
      version: "0.0.0",
    },
    servers: [],
    // Auth varies per endpoint and isn't encoded in the lexicons, so we declare it
    // globally optional: `{}` (no auth) or a bearer token. This avoids falsely
    // marking every public endpoint as "Authorization required".
    security: [{}, { Bearer: [] }],
    paths,
    components,
    tags: tags.map((name) => ({ name })),
    "x-tagGroups": tagGroups(tags),
  };

  await writeFile(OUTPUT, JSON.stringify(api, null, 2) + "\n");
  console.log(
    `Wrote ${OUTPUT}: ${Object.keys(paths).length} endpoints, ` +
      `${Object.keys(components.schemas!).length} schemas, ${tags.length} tags.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
