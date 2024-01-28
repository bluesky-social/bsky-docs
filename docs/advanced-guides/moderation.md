---
sidebar_position: 5
---

# Labels and moderation

Moderation in Bluesky consists of multiple, stackable systems, including:

1. Network takedowns which filter the content from the APIs
2. Labels placed on content by moderation services
3. User controls such as mutes and blocks

Developers building client applications should understand how to apply labels (#2) and user controls (#3).

## Labels

Labels are published by *moderation services*, which are either hardcoded into the application or chosen by the user. They are attached to records in the responses under the `labels` key.

A label is published with the following information:

```ts
{
  /** DID of the actor who created this label. */
  src: string
  /** AT URI of the record, repository (account), or other resource that this label applies to. */
  uri: string
  /** Optionally, CID specifying the specific version of 'uri' resource this label applies to. */
  cid?: string
  /** The short string name of the value or type of this label. */
  val: string
  /** If true, this is a negation label, overwriting a previous label. */
  neg?: boolean
  /** Timestamp when this label was created. */
  cts: string
}
```

The *value* of a label will determine its behavior. Some example label values are `porn`, `gore`, and `spam`.

### Label groups and user preferences

Labels are conventionally organized into *groups*, which are configurable. For example, the lable values `gore` and `corpse` can be placed in one group named `violence`. A user can then choose to ignore, warn, or hide a given label group. Not all labels are configurable this way, but most of them are.

:::info

You can find a full list of the currently-supported labels and their groups in the official atproto SDK's documentation [here](https://github.com/bluesky-social/atproto/blob/main/packages/api/docs/labels.md).
:::

## Official SDK

To simplify this task, the official SDK has an API available to developers.

### Get the user preferences

Every moderation function takes a set of options which look like this:

```typescript
{
  // the logged-in user's DID
  userDid: 'did:plc:1234...',

  // is adult content allowed?
  adultContentEnabled: true,

  // the global label settings (used on self-labels)
  labels: {
    porn: 'hide',
    sexual: 'warn',
    nudity: 'ignore',
    // ...
  }
}
```

This should match the following interfaces:

```typescript
interface ModerationOpts {
  userDid: string
  adultContentEnabled: boolean
  labels: Record<string, LabelPreference>
}

type LabelPreference = 'ignore' | 'warn' | 'hide'
```

You can construct this information using the `agent.getPreferences()` API.

### Moderating posts

The `moderatePost()` function condenses down the moderation options to the following yes or no decisions:

- `content.filter`: Do not show the post in feeds.
- `content.blur`: Put the post behind a warning cover.
- `content.noOverride`: Do not allow the post's blur cover to be lifted.
- `content.alert`: Add a warning to the post but do not cover it.
- `avatar.blur`: Put the avatar behind a cover.
- `avatar.noOverride`: Do not allow the avatars's blur cover to be lifted.
- `avatar.alert`: Put a warning icon on the avatar.
- `embed.blur`: Put the embed content (media, quote post) behind a warning cover.
- `embed.noOverride`: Do not allow the embed's blur cover to be lifted.
- `embed.alert`: Put a warning on the embed content (media, quote post).

You can find a full matrix of scenarios in the [API package docs](https://github.com/bluesky-social/atproto/blob/main/packages/api/docs/moderation-behaviors/posts.md).

```typescript
import { moderatePost } from '@atproto/api'

const postMod = moderatePost(postView, prefs.moderationPrefs)

if (postMod.content.filter) {
  // don't render in feeds or similar
  // in contexts where this is disruptive (eg threads) you should ignore this and instead check blur
}
if (postMod.content.blur) {
  // render the whole object behind a cover (use postMod.content.cause to explain)
  if (postMod.content.noOverride) {
    // do not allow the cover the be removed
  }
}
if (postMod.content.alert) {
  // render a warning on the content (use postMod.content.cause to explain)
}
if (postMod.embed.blur) {
  // render the embedded media behind a cover (use postMod.embed.cause to explain)
  if (postMod.embed.noOverride) {
    // do not allow the cover the be removed
  }
}
if (postMod.embed.alert) {
  // render a warning on the embedded media (use postMod.embed.cause to explain)
}
if (postMod.avatar.blur) {
  // render the avatar behind a cover
}
if (postMod.avatar.alert) {
  // render an alert on the avatar
}
```

### Moderating profiles

The `moderateProfile()` function condenses down the moderation options to the following yes or no decisions:

- `account.filter`: Do not show the account in feeds.
- `account.blur`: Put the account (in listings, when viewing) behind a warning cover.
- `account.noOverride`: Do not allow the account's blur cover to be lifted.
- `account.alert`: Add a warning to the account but do not cover it.
- `profile.blur`: Put the profile details (handle, display name, bio) behind a warning cover.
- `profile.noOverride`: Do not allow the profile's blur cover to be lifted.
- `profile.alert`: Add a warning to the profile but do not cover it.
- `avatar.blur`: Put the avatar behind a cover.
- `avatar.noOverride`: Do not allow the avatars's blur cover to be lifted.
- `avatar.alert`: Put a warning icon on the avatar.

You can find a full matrix of scenarios in the [API package docs](https://github.com/bluesky-social/atproto/blob/main/packages/api/docs/moderation-behaviors/profiles.md).

```typescript
import { moderateProfile } from '@atproto/api'

const profileMod = moderateProfile(profileView, getOpts())

if (profileMod.account.filter) {
  // don't render in discovery
}
if (profileMod.account.blur) {
  // render the whole account behind a cover (use profileMod.account.cause to explain)
  if (profileMod.account.noOverride) {
    // do not allow the cover the be removed
  }
}
if (profileMod.account.alert) {
  // render a warning on the account (use profileMod.account.cause to explain)
}
if (profileMod.profile.blur) {
  // render the profile information (display name, bio) behind a cover
  if (profileMod.profile.noOverride) {
    // do not allow the cover the be removed
  }
}
if (profileMod.profile.alert) {
  // render a warning on the profile (use profileMod.profile.cause to explain)
}
if (profileMod.avatar.blur) {
  // render the avatar behind a cover
}
if (profileMod.avatar.alert) {
  // render an alert on the avatar
}
```