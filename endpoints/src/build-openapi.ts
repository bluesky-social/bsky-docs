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
import { codeSamplesFor } from "./lib/codesamples";

/**
 * For chat.bsky.* and tools.ozone.*, the PDS needs an `atproto-proxy` header
 * naming the backend to forward to. We surface this as an OpenAPI header
 * parameter with a `default`, so Scalar's test-request panel pre-fills the
 * usual value and users don't have to remember the DID.
 */
function atprotoProxyParameter(id: string): OpenAPIV3_1.ParameterObject | null {
  if (id.startsWith("chat.bsky.")) {
    return {
      name: "atproto-proxy",
      in: "header",
      required: true,
      description: "Service DID for the central Bluesky chat service. Don't change this.",
      schema: { type: "string", default: "did:web:api.bsky.chat#bsky_chat" },
    };
  }
  if (id.startsWith("tools.ozone.")) {
    return {
      name: "atproto-proxy",
      in: "header",
      required: true,
      description:
        "Service DID for the target Ozone instance. The default points at Bluesky's moderation service; replace it with a different DID for self-hosted Ozone.",
      schema: { type: "string", default: "did:plc:ar7c4by46qjdydhdevvrndac#atproto_labeler" },
    };
  }
  return null;
}

function injectProxyHeader(
  op: OpenAPIV3_1.OperationObject,
  id: string,
): void {
  const param = atprotoProxyParameter(id);
  if (!param) return;
  op.parameters = [...(op.parameters ?? []), param];
}
import {
  convertArray,
  convertObject,
  convertProcedure,
  convertQuery,
  convertRecord,
  convertString,
  convertToken,
} from "./lib/converters/mod";
import { INCLUDE_PREFIXES, NAMESPACE_ORDER } from "../endpoints.config";

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
            (post as any)["x-codeSamples"] = codeSamplesFor(id, def);
            injectProxyHeader(post, id);
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
            (get as any)["x-codeSamples"] = codeSamplesFor(id, def);
            injectProxyHeader(get, id);
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
      description: [
        "This is the HTTP API reference for Bluesky. It covers the `app.bsky.*`, `com.atproto.*`, `chat.bsky.*`, and `tools.ozone.*` Lexicon namespaces — the Lexicons implemented by the Bluesky application, its related services (chat, Ozone moderation), and the AT Protocol PDS surface those services build on.",
        "The wider AT Protocol Lexicon ecosystem is open and any service can publish its own Lexicons. For an index of community Lexicons see [lexicon.garden](https://lexicon.garden/), and for the schema language itself see the [Lexicon guide](https://atproto.com/guides/lexicon).",
        "## Authentication and request routing",
        "These endpoints don't all live on the same host, and where a request should be sent depends on whether the caller is authenticated:",
        [
          "- **Most `app.bsky.*` `GET`s are public** and can be called without authentication against the Bluesky AppView at `https://public.api.bsky.app`. `POST`s (writes) and any endpoint that returns account-private data require auth.",
          "- **Authenticated requests should be sent to the user's own PDS**. The PDS validates the session and, if needed, proxies the request to the correct backend. Proxied requests should [include an `atproto-proxy` header](https://atproto.com/specs/xrpc#service-proxying).",
        ].join("\n"),
        "For client libraries that handle session management and proxying for you, see the [AT Protocol SDKs](https://atproto.com/sdks).",
      ].join("\n\n"),
      version: "0.0.0",
    },
    servers: [
      {
        url: "https://public.api.bsky.app",
        description: "Public Bluesky AppView. Use this for unauthenticated `app.bsky.*` reads — no token required.",
      },
      {
        url: "https://{host}",
        description:
          "Provide your PDS hostname. Use `bsky.social` if your account is hosted by Bluesky; replace it with your own PDS hostname (e.g. `pds.example.com`) if you're self-hosted. The PDS handles auth and proxies `app.bsky` / `chat.bsky` / `tools.ozone` calls onward. To get a token to make requests from this page, call `com.atproto.server.createSession` with your handle and an [app password](https://bsky.app/settings/app-passwords), and paste the returned `accessJwt` into the **Authentication** panel below. The token is then attached to every test request automatically.",
        variables: {
          host: { default: "bsky.social" },
        },
      },
    ],
    // Auth requirements aren't encoded in the lexicons, so we don't declare a
    // document- or operation-level `security` array — that keeps Scalar from
    // stamping a misleading "Auth Optional" badge on every endpoint. The Bearer
    // scheme stays declared in components so the Auth panel still renders, and
    // `preferredSecurityScheme` in the renderer auto-selects it for test
    // requests.
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
