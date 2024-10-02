import { expandGlob } from "std/fs/mod.ts";
import { calculateTag, loadLexicon } from "./lib/utils.ts";
import {
  convertArray,
  convertObject,
  convertProcedure,
  convertQuery,
  convertRecord,
  convertString,
  convertToken,
} from "./lib/converters/mod.ts";

import type { OpenAPIV3_1 } from "openapi-types";

const entries = expandGlob("./atproto-openapi-types/lexicons/**/*.json");

const paths: OpenAPIV3_1.PathsObject = {};
const components: OpenAPIV3_1.ComponentsObject = {
  schemas: {},
  securitySchemes: {
    Bearer: {
      type: "http",
      scheme: "bearer",
    },
  },
};
const tagNames = new Set<string>();

for await (const entry of entries) {
  const doc = await loadLexicon(entry);

  const id = doc.id;
  const defs = doc.defs;

  console.info(id);
  tagNames.add(calculateTag(id));

  for (const [name, def] of Object.entries(defs)) {
    const identifier = name === "main" ? id : `${id}.${name}`;

    // We don't want public-facing docs for unspecced endpoints
    const containsUnspecced = identifier.toLowerCase().includes('unspecced') || identifier.toLowerCase().includes('.temp.');
    const containsDeprecated = def.description?.toLowerCase().startsWith('deprecated') ?? false;

    if (containsUnspecced || containsDeprecated) {
      console.log("skipping: " + identifier)
      continue;
    }

    let descriptionPrefix = "To learn more about calling atproto API endpoints like this one, see the [/docs/advanced-guides/api-services-auth](API Services and Auth) guide."

    if (id.startsWith("tools.ozone.")) {
      descriptionPrefix = "This is endpoint is part of the [Ozone moderation service](https://ozone.tools/) APIs. Requests usually require authentication, are directed to the user's PDS intance, and proxied to the Ozone instance indicated by the DID in the service proxying header. Admin authenentication may also be possible, with request sent directly to the Ozone instance.\n\n" + descriptionPrefix
    } else if (id.startsWith("chat.bsky.")) {
      descriptionPrefix = "This is endpoint is part of the Bluesky Chat (DMs) APIs. Requests usually require authentication, are directed to the user's PDS intance, and proxied to the single central chat service by setting the appropriate service DID (`did:web:api.bsky.chat`) in the service proxying header.\n\n" + descriptionPrefix
    } else if (id.startsWith("com.atproto.admin.")) {
      descriptionPrefix = "This is endpoint is part of the atproto PDS management APIs. Requests usually require admin authentication and are made directly to the PDS instance.\n\n" + descriptionPrefix
    } else if (id.startsWith("com.atproto.sync.")) {
      descriptionPrefix = "This is endpoint is part of the atproto repository synchronization APIs. Requests usually do not require authentication, and can be made to PDS intances or Relay instances.\n\n" + descriptionPrefix
    } else if (id.startsWith("com.atproto.repo.")) {
      descriptionPrefix = "This is endpoint is part of the atproto PDS repository management APIs. Requests usually require authentication (unlike the `com.atproto.sync.*` endpoints), and are made directly to the user's own PDS instance.\n\n" + descriptionPrefix
    } else if (id.startsWith("com.atproto.server.")) {
      descriptionPrefix = "This is endpoint is part of the atproto PDS server and account management APIs. Requests often require authentication and are made directly to the user's own PDS instance.\n\n" + descriptionPrefix
    } else if (id.startsWith("app.bsky.")) {
      descriptionPrefix = "This is endpoint is part of the Bluesky application Lexicon APIs (`app.bsky.*`). Public endpoints which don't require authentication can be made directly against the public Bluesky AppView API: https://public.api.bsky.app. Authenticated requests are usually made to the user's PDS, with automatic service proxying. Authenticated requests can be used for both public and non-public endpoints.\n\n" + descriptionPrefix
    }

    switch (def.type) {
      case "array":
        components.schemas![identifier] = convertArray(id, name, def);
        break;
      case "object":
        components.schemas![identifier] = convertObject(id, name, def);
        break;
      case "procedure": {
        const post = await convertProcedure(id, name, def);

        if (post) {
          if (descriptionPrefix) {
            if (post.description) {
              post.description = descriptionPrefix + "\n\n" + def.description
            } else {
              post.description = descriptionPrefix
            }
          }
          // @ts-ignore FIXME: Also confused about ArraySchemaObject
          paths[`/xrpc/${id}`] = { post };
        }
        break;
      }
      case "query": {
        const get = await convertQuery(id, name, def);

        if (get) {
          if (descriptionPrefix) {
            if (def.description) {
              get.description = descriptionPrefix + "\n\n" + def.description
            } else {
              get.description = descriptionPrefix
            }
          }
          // @ts-ignore FIXME: Also confused about ArraySchemaObject
          paths[`/xrpc/${id}`] = { get };
        }
        break;
      }
      case "record":
        components.schemas![identifier] = convertRecord(id, name, def);
        break;
      case "string":
        components.schemas![identifier] = convertString(id, name, def);
        break;
      case "subscription":
        // No way to represent this in OpenAPI
        break;
      case "token":
        components.schemas![identifier] = convertToken(id, name, def);
        break;
      default:
        throw new Error(`Unknown type: ${def.type}`);
    }
  }
}

const api: OpenAPIV3_1.Document = {
  openapi: "3.1.0",
  info: {
    title: "AT Protocol XRPC API",
    summary:
      "Conversion of AT Protocol's lexicons to OpenAPI's schema format.",
    description: "This section contains HTTP API reference docs for Bluesky and AT Protocol lexicons. Generate a bearer token to test API calls directly from the docs.",
    version: "0.0.0", // This will be a living document for now, so no versioning yet
  },
  servers: [],
  paths,
  components,
  tags: Array.from(tagNames).map((name) => ({ name })),
};

Deno.writeTextFile("./atproto-openapi-types/spec/api.json", JSON.stringify(api, null, 2) + "\n");
