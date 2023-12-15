import type { LexXrpcQuery } from "@atproto/lexicon";
import type { OpenAPIV3_1 } from "openapi-types";

import { convertObject, convertProperty } from "./object.ts";
import {
  calculateTag,
  checkEndpoint,
  Endpoint,
  isEmptyObject,
} from "../utils.ts";

export async function convertQuery(
  id: string,
  name: string,
  query: LexXrpcQuery,
): Promise<OpenAPIV3_1.OperationObject<"GET"> | undefined> {
  const endpointType = await checkEndpoint(id, "GET");

  if (endpointType === Endpoint.DoesNotExist) {
    return;
  }

  const needsAuthentication = endpointType === Endpoint.NeedsAuthentication;

  const get = {
    tags: [calculateTag(id)],
    ...(query.description && { summary: query.description }),
    operationId: id,
    ...(needsAuthentication && {
      security: [{ Bearer: [] }],
    }),
  } as OpenAPIV3_1.OperationObject<"GET">;

  if (query.parameters && !isEmptyObject(query.parameters.properties)) {
    const properties = query.parameters.properties;
    const required = new Set(query.parameters.required ?? []);
    const parameters = [] as OpenAPIV3_1.ParameterObject[];

    for (const [name, property] of Object.entries(properties)) {
      const parameter: OpenAPIV3_1.ParameterObject = {
        name,
        in: "query",
        ...(property.description && { description: property.description }),
        required: required.has(name),
        // @ts-ignore FIXME: We know this will never be an ArraySchemaObject
        // but TypeScript doesn't. Probably just gotta break out the inner parts
        // of convertProperty more.
        schema: convertProperty(id, name, property),
      };

      parameters.push(parameter);
    }

    get.parameters = parameters;
  }

  const responses = {} as OpenAPIV3_1.ResponsesObject;

  if (query.output) {
    const output = query.output;
    const mediaType = {} as OpenAPIV3_1.MediaTypeObject;

    if (output.schema) {
      const schema = output.schema;

      mediaType.schema = schema.type === "object"
        ? convertObject(id, name, schema)
        : convertProperty(id, name, schema);
    }

    responses["200"] = {
      description: "OK",
      content: {
        [query.output.encoding]: mediaType,
      },
    };
  }

  const possibleErrors = ["InvalidRequest"]; // assuming it's always possible

  if (needsAuthentication) {
    possibleErrors.push("ExpiredToken", "InvalidToken");
  }

  if (query.errors) {
    for (const { name } of query.errors) {
      possibleErrors.push(name);
    }
  }

  responses["400"] = {
    description: "Bad Request",
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: {
              type: "string",
              enum: possibleErrors.map(name => name),
            },
            message: {
              type: "string",
            },
          },
        },
      },
    },
  };

  if (needsAuthentication) {
    responses["401"] = {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["error", "message"],
            properties: {
              error: {
                const: "AuthMissing",
              },
              message: {
                type: "string",
              },
            },
          },
        },
      },
    };
  }

  get.responses = responses;

  return get;
}
