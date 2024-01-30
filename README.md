# bsky-docs

This repository contains developer documentation for the Bluesky API (`api.bsky.app`), which is available to read at [docs.bsky.app](https://docs.bsky.app/).

The [atproto.com](https://atproto.com) website, including the AT Protocol specifications, is versioned separately at <https://github.com/bluesky-social/atproto-website>.


## Docs Development

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator. 

For live-reloading development:
1. Clone this repo
2. Run `npm install`
3. Run the development server with `npm start`
4. Open [http://localhost:3000](http://localhost:3000) with your browser.

To output a build:

- run `npm run build`

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Generate OpenAPI to Docusaurus MDX

We use a forked version of [`atproto-open-api-types`](https://github.com/rdmurphy/atproto-openapi-types) to generate an OpenAPI schema from atproto lexicons. We use the [`docusaurus-openapi-docs`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs) plugin.

To generate OpenAPI types from atproto lexicons:
1. Run `deno task run` to generate a fresh OpenAPI spec to `atproto-openapi-types/spec/api.json`.
2. Run `npx docusaurus-mdx-checker` to see MDX compatibility.
3. Run `npm run docusaurus gen-api-docs <id>` to generate MDX docs from an OpenAPI spec. In this case, `npm run docusaurus gen-api-docs bskyApi`.

If you want to regenerate MDX docs from an updated `api.json` file, run `npm run clear-and-gen-api-docs`. This command clears the existing docs and replaces them with freshly generated docs.

The OpenAPI docs auto-update with the latest lexicon changes once a day.

## Are you a developer interested in building on atproto?

Bluesky is an open social network built on the AT Protocol, a flexible technology that will never lock developers out of the ecosystems that they help build. With atproto, third-party can be as seamless as first-party through custom feeds, federated services, clients, and more.

If you're a developer interested in building on atproto, we'd love to email you a Bluesky invite code. Simply share your GitHub (or similar) profile with us via [this form](https://forms.gle/BF21oxVNZiDjDhXF9).

## License

Documentation text is under Creative Commons Attribution (CC-BY).

Inline code examples, example data, and regular expressions are under Creative Commons Zero (CC-0, aka Public Domain) and copy/pasted without attribution.

Please see [LICENSE.txt]() with reminders about derivative works, and [LICENSE-CC-BY.txt]() for a copy of license legal text.
