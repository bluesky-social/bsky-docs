import type { LexString } from "@atproto/lexicon";
import type { OpenAPIV3_1 } from "openapi-types";

import { convertProperty } from "./object";

export function convertString(
  id: string,
  name: string,
  string: LexString,
): OpenAPIV3_1.SchemaObject {
  return convertProperty(id, name, string) as OpenAPIV3_1.SchemaObject;
}
