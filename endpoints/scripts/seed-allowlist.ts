/**
 * Enumerate every query/procedure endpoint in the configured namespaces and
 * (re)build the lexicon allowlist.
 *
 * DNS resolves an individual NSID's authority, but only listing a repo enumerates
 * a whole namespace — so we list the canonical publisher accounts
 * (`SCHEMA_AUTHORITIES`), keep the query/procedure NSIDs that match
 * `INCLUDE_PREFIXES` (dropping unspecced/temp/deprecated and `EXCLUDE`), write
 * them to `lexicons.json`, and let `@atproto/lex` fetch them plus their
 * transitively-referenced defs.
 *
 * Run: `npm run seed` (re-runnable; picks up newly-published endpoints).
 */
import dns from "node:dns";
import { execFileSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

import {
  INCLUDE_PREFIXES,
  SCHEMA_AUTHORITIES,
  EXCLUDE,
} from "../endpoints.config";

// Work around nodejs/node#62347 (Windows loopback-only DNS) for our HTTPS fetches.
if (dns.getServers().every((s) => s === "127.0.0.1" || s === "::1")) {
  dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8"]);
}

const WORKSPACE = resolve(fileURLToPath(new URL("..", import.meta.url)));
const MANIFEST = resolve(WORKSPACE, "lexicons.json");
const LEXICONS_DIR = resolve(WORKSPACE, "lexicons");
const LEX_WRAPPER = resolve(WORKSPACE, "scripts/lex.mjs");

const EXCLUDE_SET = new Set(EXCLUDE);

async function pdsEndpoint(did: string): Promise<string> {
  const doc = await (await fetch(`https://plc.directory/${did}`)).json();
  const svc = doc.service.find((s: any) => s.id === "#atproto_pds");
  if (!svc) throw new Error(`No #atproto_pds service for ${did}`);
  return svc.serviceEndpoint;
}

async function listSchemaRecords(did: string): Promise<any[]> {
  const endpoint = await pdsEndpoint(did);
  const out: any[] = [];
  let cursor: string | undefined;
  do {
    const u = new URL(`${endpoint}/xrpc/com.atproto.repo.listRecords`);
    u.searchParams.set("repo", did);
    u.searchParams.set("collection", "com.atproto.lexicon.schema");
    u.searchParams.set("limit", "100");
    if (cursor) u.searchParams.set("cursor", cursor);
    const page = await (await fetch(u)).json();
    out.push(...page.records);
    cursor = page.cursor;
  } while (cursor);
  return out;
}

function shouldInclude(nsid: string, value: any): boolean {
  if (!INCLUDE_PREFIXES.some((p) => nsid.startsWith(p))) return false;
  if (EXCLUDE_SET.has(nsid)) return false;

  const lower = nsid.toLowerCase();
  if (lower.includes("unspecced") || lower.includes(".temp.")) return false;

  const main = value?.defs?.main;
  if (!main || (main.type !== "query" && main.type !== "procedure")) return false;
  if (main.description?.toLowerCase().startsWith("deprecated")) return false;

  return true;
}

async function main() {
  const nsids = new Set<string>();
  for (const did of SCHEMA_AUTHORITIES) {
    const records = await listSchemaRecords(did);
    for (const rec of records) {
      const nsid = rec.uri.split("/").pop()!;
      if (shouldInclude(nsid, rec.value)) nsids.add(nsid);
    }
  }

  const lexicons = [...nsids].sort();
  if (lexicons.length === 0) throw new Error("No endpoints enumerated — aborting.");

  // Fresh manifest (empty resolutions) + clean lexicons dir, so removed-upstream
  // endpoints don't linger. `lex install` repopulates resolutions and fetches.
  writeFileSync(
    MANIFEST,
    JSON.stringify({ version: 1, lexicons, resolutions: {} }, null, 2) + "\n",
  );
  rmSync(LEXICONS_DIR, { recursive: true, force: true });

  console.log(`Enumerated ${lexicons.length} endpoints; installing with @atproto/lex...`);
  execFileSync("node", [LEX_WRAPPER, "install"], {
    cwd: WORKSPACE,
    stdio: "inherit",
  });
  console.log(`Done. ${lexicons.length} endpoints in lexicons.json.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
