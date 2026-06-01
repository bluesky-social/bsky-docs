/**
 * Thin wrapper around the `@atproto/lex` CLI.
 *
 * Works around nodejs/node#62347: on Windows, Node can fail to read the system
 * DNS servers and falls back to `127.0.0.1`, where nothing listens — so the
 * `_lexicon.*` TXT lookups `lex` relies on fail with ECONNREFUSED, even though
 * the OS resolver works fine. We detect that loopback-only condition and point
 * Node at public resolvers. On healthy systems (incl. Linux CI) this is a no-op,
 * so CI keeps using the real system DNS.
 */
import dns from "node:dns";
import { createRequire } from "node:module";

const servers = dns.getServers();
const loopbackOnly =
  servers.length === 0 ||
  servers.every((s) => s === "127.0.0.1" || s === "::1");

if (loopbackOnly) {
  dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8"]);
  console.error(
    "[lex wrapper] Node reported loopback-only DNS (nodejs/node#62347); " +
      "overriding with public resolvers for this run.",
  );
}

// Hand off to the real CLI bin (it reads process.argv via yargs). The bin isn't
// exposed via package `exports`, so resolve it by its on-disk location.
const binUrl = new URL(
  "../node_modules/@atproto/lex/bin/lex",
  import.meta.url,
);
await import(binUrl.href);
