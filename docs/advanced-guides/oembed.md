---
sidebar_position: 15
---

# oEmbed and Post Embed Widget

Bluesky posts can be embedded in other websites a couple different ways. For a non-technical guide on how to embed Bluesky posts on other websites, [read here](https://bsky.social/about/blog/post-embeds-guide).

**HTML Snippet In-App:** there is an in-app "Embed Post" drop-down menu option on individual posts in the app, which provides an HTML snippet which can be copy/pasted.

**embed.bsky.app:** the [https://embed.bsky.app](https://embed.bsky.app) domain has a helper to paste a bsky.app URL or AT-URI and get an HTML snippet.

**oEmbed:** individual post pages on bsky.app have HTML metadata which points to the oEmbed API endpoint. This enables automatic oEmbed discovery when pasting bsky.app URLs in to third party applications, like blog or website composers.

HTML snippets include a basic version of the post text as a `<blockquote>`, as well as a Javascript `<script>` tag. The Javascript widget will overwrite the blockquote with an iframe which re-loads the post via API and renders it appropriately, including any media embeds, quote-posts, etc.

The public content policy is the same as the logged-out public web interface at [https://bsky.app](https://bsky.app): adult-only content is redacted, deleted posts or accounts are redacted, and the "no unauthenticated viewers" preference on Bluesky account preferences (a self-label on the profile record) is checked and enforced.


## oEmbed Endpoint

The official oEmbed endpoint for Bluesky posts is `https://embed.bsky.app/oembed`, which accepts the following HTTP GET query parameters:

- `url` (required): bsky.app or AT-URI pointing to a post
- `format` (optional): `json` is the default and only supported format
- `maxwidth` (optional, integer): range is `220` to `600`; default is `600`
- `maxheight` (optional, integer): part of oEmbed specification, but not used for Bluesky post embeds

The rendered height of posts is not known until rendered, so the `maxheight` is ignored and the `height` field in the response JSON is always `null`. This follows the precedent of Twitter tweet embeds.

The oEmbed response contains roughly the same HTML snippet as found at `embed.bsky.app`, with the same public content policy mentioned above.

The HTTP URL patterns which the oEmbed endpoint supports are:

* `https://bsky.app/profile/*/post/*`: post embeds

You can learn more about oEmbed at [https://oembed.com](https://oembed.com/). Bluesky is a registered provider, included in the JSON directory at [https://oembed.com/providers.json](https://oembed.com/providers.json).
