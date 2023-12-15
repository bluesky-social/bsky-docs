# AT Protocol OpenAPI Types

This repository contains OpenAPI types for the AT Protocol. They are generated
according to the [AT Protocol Specification](https://atproto.com/specs/lexicon)
by converting/translating the lexicon specs into OpenAPI types.

My hope is for this repository to serve as a live representation of the current
state of the AT Protocol viewed through the lens of OpenAPI. This could enable
the generation of client and server code for the AT Protocol in a variety of
languages.

## How to use

### I want to see what it looks like

[A Swagger UI instance prepopulated with the current version of the OpenAPI types is available to preview](https://rdmurphy.github.io/atproto-openapi-types/).
You can create a session (use an app password!), input your authentication token
and experiment with authenticated queries.

### I want the types

All you need is the `spec/api.json` file! You can reference it directly at this
URL:

[`https://raw.githubusercontent.com/rdmurphy/atproto-openapi-types/main/spec/api.json`](https://raw.githubusercontent.com/rdmurphy/atproto-openapi-types/main/spec/api.json)

> **Note:** The path to this file is subject to change, at least for a little
> while. I'll try my best to not move it but cannot pretend it won't happen
> while this project is still young!

This file is regenerated every _two_ hours
[via a GitHub Action](.github/workflows/convert.yaml) to keep it up to date with
the latest changes to the AT Protocol. It sources the
[`bluesky-social/atproto`](https://github.com/bluesky-social/atproto) repository
directly.

### I want to generate code

You'll need to use the OpenAPI generator of your choice. I've had luck with
[`openapi-typescript`](https://github.com/drwpow/openapi-typescript/tree/main/packages/openapi-typescript)!

### I want to generate the types locally

You'll need to checkout this repository and
[make sure Deno is installed](https://deno.com/manual@v1.34.0/getting_started/installation).
You'll also need to checkout a copy of the
[`bluesky-social/atproto`](https://github.com/bluesky-social/atproto) repository
**into** this repo's directory. (Maybe one day I'll get fancy and set up
submodules... but not today.)

Then, run the following command:

```sh
deno task run
```

If you'd like to tweak the generator and see your changes live you can run the
following command. It will watch for changes and re-run the script any time a
file is updated:

```sh
deno task dev
```

## Known limitations

It's currently not possible to represent the `subscription` type in OpenAPI. It
appears the maintainers of the specification
[have passed on the inclusion of any interfaces that are not strictly scoped to the HTTP protocol](https://github.com/OAI/OpenAPI-Specification/issues/55#issuecomment-1050102436).
(WebSockets **are** opened via a HTTP request, but I digress.)
[AsyncAPI](https://www.asyncapi.com/) may be a better fit for this use case.

## Existing implementations

- [Bluesky-OpenAPI](https://github.com/trozzelle/Bluesky-OpenAPI): Another AT
  Protocol to OpenAPI conversion by [@trozzelle](https://github.com/trozzelle).
  It takes a slightly different approach to naming the schemas you may prefer!

## License

MIT
