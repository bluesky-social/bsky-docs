import type { LexXrpcQuery } from "@atproto/lexicon";
import type { OpenAPIV3_1 } from "openapi-types";

import { convertObject, convertProperty } from "./object";
import { calculateTag, isEmptyObject } from "../utils";

export function convertQuery(
  id: string,
  name: string,
  query: LexXrpcQuery,
): OpenAPIV3_1.OperationObject | undefined {
  const get = {
    tags: [calculateTag(id)],
    ...(query.description && { description: query.description }),
    operationId: id,
  } as OpenAPIV3_1.OperationObject;

  if (query.parameters && !isEmptyObject(query.parameters.properties)) {
    const properties = query.parameters.properties;
    const required = new Set(query.parameters.required ?? []);
    const parameters = [] as OpenAPIV3_1.ParameterObject[];

    for (const [name, property] of Object.entries(properties)) {
      const containsDeprecated =
        property.description?.toLowerCase().includes("deprecated") ?? false;
      if (containsDeprecated) {
        continue;
      }
      const parameter: OpenAPIV3_1.ParameterObject = {
        name,
        in: "query",
        ...(property.description && { description: property.description }),
        required: required.has(name),
        // @ts-ignore We know this will never be an ArraySchemaObject here.
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
      mediaType.schema =
        schema.type === "object"
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

  const possibleErrors = ["InvalidRequest", "ExpiredToken", "InvalidToken"];

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
            error: { type: "string", enum: possibleErrors },
            message: { type: "string" },
          },
        },
      },
    },
  };

  responses["401"] = {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { const: "AuthMissing" },
            message: { type: "string" },
          },
        },
      },
    },
  };

  get.responses = responses;

  return get;
}
