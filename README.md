
# docs.bsky.app

This repository contains source code for the Bluesky developer documentation website: <https://docs.bsky.app>

This site includes tutorials, a blog, guides, and HTTP API reference docs for the Bluesky app.

The AT Protocol documentation and specifications are a separate website ([atproto.com](https://atproto.com)) maintained at <https://github.com/bluesky-social/atproto-website>.


## Building The Docs

This website is built using [Docusaurus](https://docusaurus.io/), a static website generator in JavaScript.

To build the site, first you'll need node.js and `npm` installed locally. Run `npm install` to fetch dependencies.

To run a local development server (which you can browse at <http://localhost:3000>):

    npm start

To run a static build (output in `./build/`):

    npm run build

The output can be served using any static contents hosting service.


## Updating HTTP API Reference

We use a forked version of [`atproto-openapi-types`](https://github.com/rdmurphy/atproto-openapi-types) to generate an OpenAPI schema from atproto lexicons. We use the [`docusaurus-openapi-docs`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs) plugin to convert the resulting OpenAPI schema to MDX files.

Running the MDX generation process requires `deno`.

Source code for these helpers are in `./atproto-openapi-types/`.

The raw Lexicon files are in `atproto-openapi-types/lexicons/`, with a helper script (`get-lexicons.sh`) which is run automatically by Github CI every day.

To re-generate the OpenAPI file:

    deno task run

To re-generate all of the MDX files from the OpenAPI schema file:

    npm run clear-and-gen-api-docs

You can test that the output is valid:

    npm docusaurus-mdx-checker

Then you would usually check that the entire site can still build (this is slow):

    # local dev server for preview
    npm start

    # or for a static build
    npm run build


## Docs License

Documentation text is under Creative Commons Attribution (CC-BY).

Inline code examples, example data, and regular expressions are under Creative Commons Zero (CC-0, aka Public Domain) and copy/pasted without attribution.

Please see [LICENSE.txt]() with reminders about derivative works, and [LICENSE-CC-BY.txt]() for a copy of license legal text.
