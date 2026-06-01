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
