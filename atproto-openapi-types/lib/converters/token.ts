import type { LexToken } from "@atproto/lexicon";
import type { OpenAPIV3_1 } from "openapi-types";

import { convertProperty } from "./object.ts";

export function convertToken(
  id: string,
  name: string,
  token: LexToken,
): OpenAPIV3_1.SchemaObject {
  return convertProperty(id, name, token);
}
