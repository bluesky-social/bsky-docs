import type { LexArray } from "@atproto/lexicon";
import type { OpenAPIV3_1 } from "openapi-types";

import { convertProperty } from "./object.ts";

export function convertArray(
  id: string,
  name: string,
  array: LexArray,
): OpenAPIV3_1.SchemaObject {
  return convertProperty(id, name, array);
}
