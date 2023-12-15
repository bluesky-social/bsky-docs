import type { LexXrpcProcedure } from "@atproto/lexicon";
import type { OpenAPIV3_1 } from "openapi-types";

import { convertObject, convertProperty } from "./object.ts";
import { calculateTag, checkEndpoint, Endpoint } from "../utils.ts";

export async function convertProcedure(
  id: string,
  name: string,
  procedure: LexXrpcProcedure,
): Promise<OpenAPIV3_1.OperationObject<"POST"> | undefined> {
  const endpointType = await checkEndpoint(id, "POST");

  if (endpointType === Endpoint.DoesNotExist) {
    return;
  }

  const needsAuthentication = endpointType === Endpoint.NeedsAuthentication;

  const post = {
    tags: [calculateTag(id)],
    ...(procedure.description && { summary: procedure.description }),
    operationId: id,
    ...(needsAuthentication && { security: [{ Bearer: [] }] }),
  } as OpenAPIV3_1.OperationObject<"POST">;

  if (procedure.input) {
    const input = procedure.input;
    const mediaType = {} as OpenAPIV3_1.MediaTypeObject;

    if (input.schema) {
      const schema = input.schema;

      mediaType.schema = schema.type === "object"
        ? convertObject(id, name, schema)
        : convertProperty(id, name, schema);
    }

    const requestBody: OpenAPIV3_1.RequestBodyObject = {
      required: true,
      content: {
        [procedure.input!.encoding]: mediaType,
      },
    };

    post.requestBody = requestBody;
  }

  const responses = {} as OpenAPIV3_1.ResponsesObject;

  if (procedure.output) {
    const output = procedure.output;
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
        [procedure.output.encoding]: mediaType,
      },
    };
  } else {
    responses["200"] = {
      description: "OK",
    };
  }

  const possibleErrors = ["InvalidRequest"]; // assuming it's always possible

  if (needsAuthentication) {
    possibleErrors.push("ExpiredToken", "InvalidToken");
  }

  if (procedure.errors) {
    for (const { name } of procedure.errors) {
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
              // enum: possibleErrors.map((name) => ({ const: name })),
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

  post.responses = responses;

  return post;
}
