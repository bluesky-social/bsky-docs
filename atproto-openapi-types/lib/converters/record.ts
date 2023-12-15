import type { LexRecord } from "@atproto/lexicon";
import type { OpenAPIV3_1 } from "openapi-types";

import { convertObject } from "./object.ts";

export function convertRecord(
  id: string,
  name: string,
  record: LexRecord,
): OpenAPIV3_1.SchemaObject {
  return convertObject(id, name, record.record);
}
