---
sidebar_position: 12
---

# Read after write

Services such as the appview do not have transational writes from a user's PDS. Therefore the views that they calculate are eventually consistent. In other words, a user may have created a record on their PDS that is not yet reflected in the API responses provided by the Appview.

The effect of this is that a user may take some action - for instance, updating their profile - rapidly refresh the view, and find that their recent change is not reflected in the updated response.

Because all requests from the application are sent to the user's PDS, the PDS is in a position to smooth over this behvaior. Our PDS distribution provides some basic read-after-write behaviors by looking at response headers from the Appview, determining if there are any new records that are not in the response, and modifying the response to reflect those new records.

The Appview communicates the current state of it's indicies by setting the `Atproto-Repo-Rev` response header. This is set the the `rev` of the most recent commit that's been indexed from the requesting user's repository. If the PDS sees this header on a response, it will search for all records that it has locally that are more recent than the provided rev and determine if they affect the Appview's response.

This read-after-write behavior _only_ applies to records from the user making the request. Records from other users that happen to be on the same PDS will not affect the requesting user's response.

This behavior is somewhat at odds with the PDS's role in the network as an application-agnostic service. However, importantly, this read-after-write logic requires no application-specific indices, only application-specific logic. In the future this ability may be abstracted into a generic interface such that other applications can create "PDS plugins" to provide similar behavior.

### Supported routes

This behavior is not applied exhaustively to all view routes in the PDS. We started with the views where it is most disruptive to have out of date data. Those include:

- `app.bsky.actor.getProfile`
- `app.bsky.actor.getProfiles`
- `app.bsky.feed.getActorLikes`
- `app.bsky.feed.getAuthorFeed`
- `app.bsky.feed.getListFeed`
- `app.bsky.feed.getPostThread`
- `app.bsky.feed.getTimeline`

This list will likely increase over time.