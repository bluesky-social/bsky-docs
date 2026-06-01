import { readFile } from "node:fs/promises";
import type { LexiconDoc } from "@atproto/lexicon";

export async function loadLexicon(path: string): Promise<LexiconDoc> {
  const file = await readFile(path, "utf8");
  return JSON.parse(file) as LexiconDoc;
}

export function isEmptyObject(object: Record<string, unknown>) {
  return Object.keys(object).length === 0;
}

/** Tag/group key for an endpoint: first three NSID segments (e.g. `app.bsky.actor`). */
export function calculateTag(id: string): string {
  return id.split(".").slice(0, 3).join(".");
}
