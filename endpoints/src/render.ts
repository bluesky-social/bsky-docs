/**
 * Static renderer. Produces a fully self-contained `out/`:
 *   - openapi.json       (the generated spec, also downloadable)
 *   - scalar.standalone.js (vendored from @scalar/api-reference, MIT)
 *   - index.html         (loads the local bundle, points it at openapi.json)
 *
 * No CLI, no SaaS, no runtime calls to a hosted service. Open `out/index.html`
 * over http (e.g. `npx serve out`) — file:// won't fetch the local JSON.
 */
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const OUT = resolve(process.cwd(), "out");
const OPENAPI = resolve(process.cwd(), "openapi.json");

// Resolve the vendored Scalar standalone browser bundle. The package `exports`
// map blocks deep imports, so resolve the main entry (dist/index.js) and derive
// the sibling browser bundle from its directory.
const scalarMain = require.resolve("@scalar/api-reference");
const scalarStandalone = resolve(dirname(scalarMain), "browser/standalone.js");

const HTML = `<!doctype html>
<html lang="en">
  <head>
    <title>Bluesky HTTP API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="data:," />
  </head>
  <body>
    <div id="app"></div>
    <script src="./scalar.standalone.js"></script>
    <script>
      Scalar.createApiReference('#app', {
        url: './openapi.json',
        // Omit the catch-all "Models" section — component schemas still render
        // inline within each endpoint's request/response.
        hideModels: true,
        // Follow the spec's tag / x-tagGroups order (app.bsky, com.atproto, ...).
        tagsSorter: 'default',
        // Hide every auto-generated httpsnippet client. Each operation supplies
        // its own TS/Go/curl snippets via x-codeSamples; with no clientOptions,
        // Scalar also drops the otherwise-empty "Client Libraries" intro card.
        hiddenClients: true,
        // The spec declares the Bearer scheme in components.securitySchemes
        // but no document-level security array (to avoid the misleading
        // "Auth Optional" badge on every endpoint). Pre-select Bearer in the
        // intro Auth panel so a token entered there is applied to every test
        // request.
        authentication: { preferredSecurityScheme: 'Bearer' },
        // Rename the intro server card's "Server" title-bar label to
        // "Demo Server" so it's obvious the host picker only powers in-page
        // test requests. Scalar hard-codes "Server" in ServerSelector.vue.
        // The title-bar label carries .bg-b-2.rounded-t-xl (other labels
        // inside the card — e.g. the host variable input's label — don't),
        // so this selector hits only the title bar.
        customCss: \`
          .scalar-reference-intro-server label.bg-b-2.rounded-t-xl { font-size: 0; }
          .scalar-reference-intro-server label.bg-b-2.rounded-t-xl::before {
            content: 'Demo Server';
            font-size: 0.875rem;
            font-weight: 500;
          }
        \`,
      })
    </script>
  </body>
</html>
`;

async function main() {
  await mkdir(OUT, { recursive: true });
  await copyFile(OPENAPI, resolve(OUT, "openapi.json"));
  await copyFile(scalarStandalone, resolve(OUT, "scalar.standalone.js"));
  await writeFile(resolve(OUT, "index.html"), HTML);
  console.log(`Wrote static site to ${OUT} (index.html, openapi.json, scalar.standalone.js).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
