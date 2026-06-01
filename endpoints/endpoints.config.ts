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
 * - `descriptionPrefixFor` ports the per-namespace auth/proxy guidance.
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

export const DEFAULT_DESCRIPTION_PREFIX =
  "*To learn more about calling atproto API endpoints like this one, see the [API Hosts and Auth](https://docs.bsky.app/docs/advanced-guides/api-directory) guide.*";

/**
 * Per-namespace auth/proxy guidance, prepended to each operation's description.
 * Ported verbatim (intent-wise) from atproto-openapi-types/main.ts.
 */
export function descriptionPrefixFor(id: string): string {
  if (id.startsWith("tools.ozone.")) {
    return (
      "*This endpoint is part of the [Ozone moderation service](https://ozone.tools/) APIs. Requests usually require authentication, are directed to the user's PDS instance, and proxied to the Ozone instance indicated by the DID in the service proxying header. Admin authentication may also be possible, with request sent directly to the Ozone instance.*\n\n" +
      DEFAULT_DESCRIPTION_PREFIX
    );
  }
  if (id.startsWith("chat.bsky.")) {
    return (
      "*This endpoint is part of the Bluesky Chat (DMs) APIs. Requests usually require authentication, are directed to the user's PDS instance, and proxied to the single central chat service by setting the appropriate service DID (`did:web:api.bsky.chat`) in the service proxying header.*\n\n" +
      DEFAULT_DESCRIPTION_PREFIX
    );
  }
  if (id.startsWith("com.atproto.admin.")) {
    return (
      "*This endpoint is part of the atproto PDS management APIs. Requests usually require admin authentication and are made directly to the PDS instance.*\n\n" +
      DEFAULT_DESCRIPTION_PREFIX
    );
  }
  if (id.startsWith("com.atproto.sync.")) {
    return (
      "*This endpoint is part of the atproto repository synchronization APIs. Requests usually do not require authentication.*\n\n" +
      DEFAULT_DESCRIPTION_PREFIX
    );
  }
  if (id.startsWith("com.atproto.repo.")) {
    return (
      "*This endpoint is part of the atproto PDS repository management APIs. Requests usually require authentication (unlike the `com.atproto.sync.*` endpoints), and are made directly to the user's own PDS instance.*\n\n" +
      DEFAULT_DESCRIPTION_PREFIX
    );
  }
  if (id.startsWith("com.atproto.server.")) {
    return (
      "*This endpoint is part of the atproto PDS server and account management APIs. Requests often require authentication and are made directly to the user's own PDS instance.*\n\n" +
      DEFAULT_DESCRIPTION_PREFIX
    );
  }
  if (id.startsWith("app.bsky.")) {
    return (
      "*This endpoint is part of the Bluesky application Lexicon APIs (`app.bsky.*`). Public endpoints which don't require authentication can be made directly against the public Bluesky AppView API: https://public.api.bsky.app. Authenticated requests are usually proxied via the user's PDS, using service proxy headers. Authenticated requests can be used for both public and non-public endpoints.*\n\n" +
      DEFAULT_DESCRIPTION_PREFIX
    );
  }
  return DEFAULT_DESCRIPTION_PREFIX;
}
