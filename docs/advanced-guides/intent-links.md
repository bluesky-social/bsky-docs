---
sidebar_position: 16
---

# Action Intent Links

Authors, websites, and apps can use action intent links to implement "Share on Bluesky" buttons, or similar in-app actions. Logged-in users will be directed to the corresponding action view in the Bluesky app (mobile or web app) with context pre-populated. Logged-out users will be prompted to sign-in or create an account first. Following the link does not automatically result in the action; the logged-in user still needs to confirm the action.

Currently only the `compose` action URL endpoint is implemented.


## Compose Post

The `compose` action URL pre-populates the compose post UI in the Bluesky Social app. A common use case for this action is to implement "Share on Bluesky" style buttons, where a brief description and URL are pre-populated in the post compose box. Similarly, "Share this Article" or "Share your Achievement".

The web URL endpoint is `https://bsky.app/intent/compose`, with the HTTP query parameter `text`. Remember to use URL-escaping on the query parameter value, and that the post length limit on Bluesky is 300 characters (more precisely, 300 Unicode Grapheme Clusters).

The mobile app URI endpoint is `bluesky://intent/compose`, with the same query parameter.

For example, [Share These Docs](https://bsky.app/intent/compose?text=I%27m%20reading%20through%20the%20Bluesky%20API%20docs%21%20%F0%9F%A6%8B%0Ahttps%3A//docs.bsky.app)!


## Button Styling

The Bluesky logo is included in [Font Awesome](https://fontawesome.com/), which can be used as a favicon-style prefix to links.

A higher resolution version of the butterfly logo is included in the Bluesky Press Kit (linked from the bottom of our [Press FAQ page](https://bsky.social/about/blog/press-faq)).
