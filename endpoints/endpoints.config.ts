/**
 * Source-of-truth configuration for the standalone endpoints reference.
 *
 * The reference covers exactly the namespaces in `INCLUDE_PREFIXES`. The set of
 * endpoints is derived automatically: `scripts/seed-allowlist.ts` enumerates every
 * query/procedure NSID published in those namespaces (skipping unspecced/temp/
 * deprecated and anything in `EXCLUDE`), writes them to `lexicons.json`, and
 * `@atproto/lex` fetches them plus any transitively-referenced schema defs. The
 * defs are needed for `$ref`s but are never listed as endpoints.
 *
 * - `INCLUDE_PREFIXES` — the curated namespaces. This is the one place to widen or
 *   narrow scope. Editing it changes what `seed-allowlist` pulls in and what the
 *   converter is willing to emit a path for.
 * - `NAMESPACE_ORDER` biases grouping/order in the rendered reference.
 */

/** Namespaces this reference covers (and the only ones converted to endpoints). */
export const INCLUDE_PREFIXES: string[] = [
  "app.bsky.",
  "com.atproto.",
  "chat.bsky.",
  "tools.ozone.",
];

/**
 * Canonical accounts that publish the `com.atproto.lexicon.schema` records for the
 * namespaces above. Used by `seed-allowlist` to ENUMERATE every endpoint: DNS
 * resolves an individual NSID's authority, but only listing a repo enumerates a
 * whole namespace. These are stable; each can be re-derived from the `_lexicon.*`
 * TXT records (e.g. did:plc:4v4y5r3... is `bsky-lexicons.bsky.social`).
 */
export const SCHEMA_AUTHORITIES: string[] = [
  "did:plc:4v4y5r3lwsbtmsxhile2ljac", // app.bsky.*, chat.bsky.*
  "did:plc:6msi3pj7krzih5qxqtryxlzw", // com.atproto.*
  "did:plc:33dt5kftu3jq2h5h4jjlqezt", // tools.ozone.*
];

/** Exact NSIDs to drop even though they are query/procedure endpoints. */
export const EXCLUDE: string[] = [];

/**
 * Group/sort bias: namespaces matching earlier prefixes render first. Anything not
 * matched falls to the end in lexical order. Used to build OpenAPI `x-tagGroups`
 * and to sort the `tags` array.
 */
export const NAMESPACE_ORDER: string[] = [
  "app.bsky.",
  "com.atproto.",
  "chat.bsky.",
  "tools.ozone.",
];

