# Bluesky HTTP API endpoint reference

A standalone, OpenAPI-driven static reference for Bluesky's HTTP/XRPC endpoints,
generated from the canonical on-network lexicon schemas. This replaces the old
`docs/api` reference that was embedded in (and slowed down) the Docusaurus build.

## How it works

```
endpoints.config.ts (INCLUDE_PREFIXES + SCHEMA_AUTHORITIES)
      │  scripts/seed-allowlist.ts  (enumerate every query/procedure NSID)
      ▼
lexicons.json (allowlist, CID-pinned)
      │  @atproto/lex  (resolves NSIDs via DNS, fetches + transitive defs)
      ▼
lexicons/**/*.json  (committed lexicon documents)
      │  src/build-openapi.ts  (lexicon -> OpenAPI converter)
      ▼
openapi.json
      │  src/render.ts  (vendors Scalar's MIT standalone bundle)
      ▼
out/  (index.html + openapi.json + scalar.standalone.js — fully self-contained)
```

- **Scope is by namespace, endpoints are auto-discovered.** `INCLUDE_PREFIXES` in
  `endpoints.config.ts` defines which namespaces the reference covers
  (`app.bsky.*`, `com.atproto.*`, `chat.bsky.*`, `tools.ozone.*`). `npm run seed`
  enumerates *every* query/procedure NSID published in them (from the canonical
  accounts in `SCHEMA_AUTHORITIES`), skipping unspecced/temp/deprecated and
  anything in `EXCLUDE`, and writes the result to `lexicons.json`.
- **Only endpoints get cards.** The converter emits a path (and sidebar tag) only
  for query/procedure defs in the included namespaces. Referenced schema defs
  (`*.defs`, records, tokens) become OpenAPI components — needed for `$ref`s — but
  never appear as empty endpoint cards. Deprecated schema defs are kept (so refs
  don't dangle) but flagged `deprecated`.
- **Bluesky-first ordering:** `NAMESPACE_ORDER` biases `app.bsky.*` and
  `com.atproto.*` ahead of the rest (rendered via OpenAPI `x-tagGroups`).
  Shared auth/proxy guidance lives in the OpenAPI `info.description` rendered
  as the reference's Introduction.
- **No SaaS:** the rendered site embeds Scalar's open-source (MIT) `api-reference`
  bundle, vendored locally. No hosted service, no runtime external calls, and a
  downloadable `openapi.json` for Postman/SDK codegen/etc.

## Commands

```bash
npm install                  # one-time
npm run seed                 # enumerate endpoints in INCLUDE_PREFIXES -> lexicons.json + fetch
npm run build                # install-lexicons:ci -> build:openapi -> build:site
npm run build:openapi        # lexicons/ -> openapi.json
npm run build:site           # openapi.json -> out/
npx serve out                # preview (use http; file:// won't fetch the JSON)
```

Changing scope: edit `INCLUDE_PREFIXES` / `EXCLUDE` in `endpoints.config.ts`, run
`npm run seed`, then commit `lexicons.json` + `lexicons/`. The refresh CI runs
`npm run seed` weekly and opens a PR when the published endpoints change.

## CI

- `.github/workflows/endpoints-build.yml` — verifies pinned lexicons, builds the
  spec + site, uploads the artifact (deploy step deferred to the host).
- `.github/workflows/endpoints-refresh-lexicons.yml` — weekly `lex install
  --update`; opens a PR when canonical schemas change.

## Notes

- `scripts/lex.mjs` wraps the `@atproto/lex` CLI to work around
  [nodejs/node#62347](https://github.com/nodejs/node/issues/62347) (Windows-only
  loopback-DNS bug that breaks `lex`'s `_lexicon.*` TXT lookups). It is a no-op on
  healthy systems, including Linux CI.
- `openapi.json` and `out/` are git-ignored; they are regenerated from the
  committed `lexicons/` + `lexicons.json`.
