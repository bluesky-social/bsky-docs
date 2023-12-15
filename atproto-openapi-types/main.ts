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
          // @ts-ignore FIXME: Also confused about ArraySchemaObject
          paths[`/${id}`] = { post };
        }
        break;
      }
      case "query": {
        const get = await convertQuery(id, name, def);

        if (get) {
          // @ts-ignore FIXME: Also confused about ArraySchemaObject
          paths[`/${id}`] = { get };
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
      "An unofficial conversion of AT Protocol's lexicons to OpenAPI's schema format.",
    version: "0.0.0", // This will be a living document for now, so no versioning yet
    license: {
      name: "MIT License",
      identifier: "MIT",
    },
  },
  servers: [
    {
      url: "https://bsky.social/xrpc/",
      description: "AT Protocol PDS XRPC server",
    },
    {
      url: "https://api.bsky.app/xrpc/",
      description: "AT Protocol AppView XRPC server",
    },
  ],
  paths,
  components,
  tags: Array.from(tagNames).map((name) => ({ name })),
};

Deno.writeTextFile("./atproto-openapi-types/spec/api.json", JSON.stringify(api, null, 2) + "\n");
