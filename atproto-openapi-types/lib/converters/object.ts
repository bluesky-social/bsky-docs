import type {
  LexArray,
  LexBlob,
  LexIpldType,
  LexObject,
  LexPrimitive,
  LexRefVariant,
  LexStringFormat,
  LexToken,
} from "@atproto/lexicon";
import type { OpenAPIV3_1 } from "openapi-types";

export function convertObject(
  id: string,
  name: string,
  object: LexObject,
): OpenAPIV3_1.SchemaObject {
  var properties = convertProperties(id, name, object.properties);

  // TODO: HACK(bnewbold): prevent "MimeTabs missing TabItem" error
  if ((id == "app.bsky.feed.sendInteractions" || id == "chat.bsky.actor.deleteAccount" || id == "tools.ozone.set.deleteSet") && Object.keys(properties).length == 0) {
    properties = {
      _unknown_: {
        type: "object",
        properties: {},
      }
    }
  }

  return {
    type: "object",
    ...(object.description && { description: object.description }),
    ...(object.required && { required: object.required }),
    ...(properties && { properties }),
  };
}

function convertProperties(
  id: string,
  name: string,
  properties: LexObject["properties"],
) {
  if (!properties) return;

  const converted: OpenAPIV3_1.SchemaObject["properties"] = {};

  for (const [key, property] of Object.entries(properties)) {
    const containsDeprecated = property.description?.toLowerCase().includes('deprecated') ?? false;
    if (containsDeprecated) {
      continue;
    }
    converted[key] = convertProperty(id, name, property);
  }

  return converted;
}

type LexObjectProperty =
  | LexRefVariant
  | LexIpldType
  | LexArray
  | LexBlob
  | LexPrimitive
  | LexToken;

export function convertProperty(
  id: string,
  name: string,
  property: LexObjectProperty,
): OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject {
  const type = property.type;

  switch (type) {
    case "string":
      // WARNING: This is a hack to get around the fact that these references
      // don't follow the spec of Lexicons for some reason
      if (
        (id === "app.bsky.graph.defs" && name === "listPurpose") ||
        (id === "com.atproto.moderation.defs" && name === "reasonType") ||
        (id === "com.atproto.admin.defs" && name === "actionType")
      ) {
        // Force them to be a union instead
        return convertProperty(id, name, {
          type: "union",
          refs: property.knownValues!,
        });
      }

      return {
        type: "string",
        ...(property.description && { description: property.description }),
        ...(property.format && {
          format: convertStringFormat(property.format),
        }),
        ...(property.minLength !== undefined && {
          minLength: property.minLength,
        }),
        ...(property.maxLength !== undefined && {
          maxLength: property.maxLength,
        }),
        ...(property.default && { default: property.default }),
        ...(property.knownValues && { enum: property.knownValues }),
      };
    case "integer":
      return {
        type: "integer",
        ...(property.minimum !== undefined && { minimum: property.minimum }),
        ...(property.maximum !== undefined && { maximum: property.maximum }),
        ...(property.default && { default: property.default }),
      };
    case "boolean":
      return {
        type: "boolean",
        ...(property.description && { description: property.description }),
        ...(property.default && { default: property.default }),
        ...(property.const && { default: true }),
      };
    case "blob":
      return {
        type: "string",
        format: "binary",
        ...(property.maxSize !== undefined && { maxLength: property.maxSize }),
      };
    case "bytes":
      return {
        type: "string",
        format: "byte",
        ...(property.description && { description: property.description }),
        ...(property.maxLength !== undefined && {
          maxLength: property.maxLength,
        }),
      };
    case "cid-link":
      return {
        type: "string",
        format: "cid-link",
      };
    case "ref":
      return {
        $ref: `#/components/schemas/${getRefLabel(id, property.ref)}`,
      };
    case "union":
      return {
        oneOf: property.refs.map((ref) => ({
          $ref: `#/components/schemas/${getRefLabel(id, ref)}`,
        })),
      };
    case "array":
      return {
        type: "array",
        items: convertProperty(id, name, property.items),
        ...(property.maxLength !== undefined && {
          maxItems: property.maxLength,
        }),
      };
    case "token":
      return {
        type: "string",
        format: "token",
        ...(property.description && { description: property.description }),
      };
    case "unknown":
      // AFAICT this is how to tell OpenAPI we don't know the type
      return {};
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

function getRefLabel(id: string, ref: string) {
  // A local to file reference
  if (ref.startsWith("#")) {
    return `${id}${ref.replace("#", ".")}`;
  }

  // Reference already includes the lexicon name
  if (ref.includes("#")) {
    return ref.replace("#", ".");
  }

  // Reference is just a lexicon name
  return ref;
}

function convertStringFormat(format: LexStringFormat) {
  if (format === "datetime") return "date-time";

  return format;
}
