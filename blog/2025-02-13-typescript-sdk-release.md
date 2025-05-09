---
slug: api-v0-14-0-release-notes
title: '@atproto/api v0.14.0 release notes'
tags: ['updates', 'guide']
---

Today we are excited to announce the availability of version 0.14 of our TypeScript SDK on [npm](https://www.npmjs.com/package/@atproto/api).

This release is a big step forward, significantly improving the type safety of our `@atproto/api` package. Let’s take a look at the highlights:

- **Lexicon derived interfaces now have an explicitly defined `$type` property**, allowing proper discrimination of unions.
- **Lexicon derived `is*` utility methods no longer unsafely type cast their input**.
- **Lexicon derived `validate*` utility methods now return a more precise type**.

## Context

Atproto is an "open protocol" which means a lot of things. One of these things is that the data structures handled through the protocol are extensible. Lexicons (which is the syntax used to define the schema of the data structures) can be used to describe placeholders where arbitrary data types (defined through third-party Lexicons) can be used.

An example of such a placeholder exists in the Lexicon definition of a Bluesky post
([`app.bsky.feed.post`](https://github.com/bluesky-social/atproto/blob/5ece8c6aeab9c5c3f51295d93ed6e27c3c6095c2/lexicons/app/bsky/feed/post.json#L5-L64)), which enables posts to have an `embed` property defined as follows:

```javascript
  "embed": {
    "type": "union",
    "refs": [
      "app.bsky.embed.images",
      "app.bsky.embed.video",
      "app.bsky.embed.external",
      "app.bsky.embed.record",
      "app.bsky.embed.recordWithMedia",
    ]
  }
```

The type of the `embed` property is what is called an "open union". It means that the `embed` field can basically contain anything, although we usually expect it to be one of the known types defined in the `refs` array of the Lexicon schema (an image, a video, a link, or another post).

Systems consuming Bluesky posts need to be able to determine what type of embed they are dealing with. This is where the `$type` property comes in. This property allows systems to uniquely determine the Lexicon schema that must be used to interpret the data, and it **must** be provided everywhere a union is expected. For example, a post with a video would look like this:

```javascript
{
  "text": "Hey, check this out!",
  "createdAt": "2021-09-01T12:34:56Z",
  "embed": {
    "$type": "app.bsky.embed.video",
    "video": {
      /* reference to the video file, omitted for brevity */
    }
  }
}
```

Since `embed` is an open union, it can be used to store anything. For example, a post with a calendar event embed could look like this:

```javascript
{
  "text": "Hey, check this out!",
  "createdAt": "2021-09-01T12:34:56Z",
  "embed": {
    "$type": "com.example.calendar.event",
    "eventName": "Party at my house",
    "eventDate": "2021-09-01T12:34:56Z"
  }
}
```

:::note
Only systems that know about the `com.example.calendar.event` Lexicon can interpret this data. The official Bluesky app will typically only know about the data types defined in the `app.bsky` lexicons.
:::

## Revamped TypeScript interfaces

In order to facilitate working with the Bluesky API, we provide TypeScript interfaces generated from the lexicons (using a tool called [lex-cli](https://www.npmjs.com/package/@atproto/lex-cli)). These interfaces are made available through the `@atproto/api` package.

For historical reasons, these generated types were missing the `$type` property. The interface for the `app.bsky.embed.video`, for example, used to look like this:

```typescript
export interface Main {
  video: BlobRef
  captions?: Caption[]
  alt?: string
  aspectRatio?: AppBskyEmbedDefs.AspectRatio
  [k: string]: unknown
}
```

Because the `$type` property is missing from that interface, developers could write invalid code, without getting an error from TypeScript:

```typescript
import { AppBskyFeedPost } from '@atproto/api'

const myPost: AppBskyFeedPost.Main = {
  text: 'Hey, check this out!',
  createdAt: '2021-09-01T12:34:56Z',
  embed: {
    // Notice how we are missing the `$type` property
    // here. TypeScript did not complain about this.

    video: {
      /* reference to the video file, omitted for brevity */
    },
  },
}
```

Similarly, a Bluesky post’s `embed` property was [previously](https://github.com/bluesky-social/atproto/blob/5ece8c6aeab9c5c3f51295d93ed6e27c3c6095c2/packages/api/src/client/types/app/bsky/feed/post.ts#L25-L31) typed like this:

```typescript
export interface Record {
  // ...
  embed?:
    | AppBskyEmbedImages.Main
    | AppBskyEmbedVideo.Main
    | AppBskyEmbedExternal.Main
    | AppBskyEmbedRecord.Main
    | AppBskyEmbedRecordWithMedia.Main
    | { $type: string; [k: string]: unknown }
}
```

It was therefore possible to create a post with a completely invalid "video" embed, and still get no error from the type system:

```typescript
import { AppBskyFeedPost } from '@atproto/api'

const myPost: AppBskyFeedPost.Main = {
  text: 'Hey, check this out!',
  createdAt: '2021-09-01T12:34:56Z',

  // This is an invalid embed, but TypeScript
  // does not complain.
  embed: {
    $type: 'app.bsky.embed.video',
    video: 43,
  },
}
```

We have fixed these issues by making the `$type` property in the generated interfaces explicit. The `app.bsky.embed.video` interface now looks like this:

```typescript
export interface Main {
  $type?: 'app.bsky.embed.video'
  video: BlobRef
  captions?: Caption[]
  alt?: string
  aspectRatio?: AppBskyEmbedDefs.AspectRatio
}
```

Notice how the `$type` property is defined as optional (`?:`) here. This is due to the fact that the schema definitions are not always used from open unions. In some cases, a particular schema can be referenced from another schema (using a `"type": "ref"`). In those cases, there will be no ambiguity as to how the data should be interpreted.

For example, a "Bluesky Like" (`app.bsky.feed.like`) defines the following properties in its schema:

```typescript
  "properties": {
    "createdAt": { "type": "string", "format": "datetime" },
    "subject": { "type": "ref", "ref": "com.atproto.repo.strongRef" }
  },
```

As can be seen, the `subject` property is defined as a reference to a `com.atproto.repo.strongRef` object. In this case, there is no ambiguity as to how the `subject` of a like should be interpreted, and the `$type` property is not needed.

```typescript
const like: AppBskyFeedLike.Record = {
  $type: 'app.bsky.feed.like',
  createdAt: '2021-09-01T12:34:56Z',
  subject: {
    // No `$type` property needed here
    uri: 'at://did:plc:123/app.bsky.feed.post/456',
    cid: '[...]',
  },
}
```

Because the `$type` property of objects is required in some contexts while optional in others, we introduced a new type utility type to make it required when needed. The `$Typed` utility allows marking an interface’s `$type` property non-optional in contexts where it is required:

```typescript
export type $Typed<V> = V & { $type: string }
```

The `embed` property of posts is now defined as follows:

```typescript
export interface Record {
  // ...
  embed?:
    | $Typed<AppBskyEmbedImages.Main>
    | $Typed<AppBskyEmbedVideo.Main>
    | $Typed<AppBskyEmbedExternal.Main>
    | $Typed<AppBskyEmbedRecord.Main>
    | $Typed<AppBskyEmbedRecordWithMedia.Main>
    | { $type: string }
}
```

In addition to preventing the _creation_ of invalid data as seen before, this change also allows properly discriminating types when _accessing_ the data. For example, one can now do:

```typescript
import { AppBskyFeedPost } from '@atproto/api'

// Say we got some random post somehow (typically
// via an API call)
declare const post: AppBskyFeedPost.Main

// And we want to know what kind of embed it contains
const { embed } = post

// We can now use the `$type` property to disambiguate
if (embed?.$type === 'app.bsky.embed.images') {
  // The `embed` variable is fully typed as
  // `$Typed<AppBskyEmbedImages.Main>` here!
}
```

### `$type` property in `record` definitions

While optional in interfaces generated from Lexicon `object` definitions, the `$type` property is **required** in interfaces generated from Lexicon `record` definitions.

### `is*` utility methods

The example above shows how data can be discriminated based on the `$type` property. The SDK provides utility methods to perform this kind of discrimination. These methods are named `is*` and are generated from the lexicons. For example, the `app.bsky.embed.images` Lexicon used to generate the following `isMain` utility method:

```typescript
export interface Main {
  images: Image[]
  [x: string]: unknown
}

export function isMain(value: unknown): value is Main {
  return (
    value != null &&
    typeof value === 'object' &&
    '$type' in value &&
    (value.$type === 'app.bsky.embed.images' ||
      value.$type === 'app.bsky.embed.images#main')
  )
}
```

That implementation of the discriminator is invalid.

- First, because a `$type` is not allowed to end with `#main` ([as per AT Protocol specification](https://atproto.com/specs/lexicon#lexicon-files)).
- Second, because the `isMain` function does not actually check the structure of the object, only its `$type` property.

This invalid behavior could yield runtime errors that could otherwise have been avoided during development:

```typescript
import { AppBskyEmbedImages } from '@atproto/api'

// Get an invalid embed somehow
const invalidEmbed = {
  $type: 'app.bsky.embed.images',
  // notice how the `images` property is missing here
}

// This predicate function only checks the value of
// the `$type` property, making the condition "true" here
if (AppBskyEmbedImages.isMain(invalidEmbed)) {
  // However, the `images` property is missing here.
  // TypeScript does not complain about this, but the
  // following line will throw a runtime error:
  console.log('First image:', invalidEmbed.images[0])
}
```

The root of the issue here is that the `is*` utility methods perform type casting of objects solely based on the value of their `$type` property. There were basically two ways we could fix this behavior:

1. Alter the implementation to actually validate the object's structure. This would be a non-breaking change that has a negative impact on performance.
2. Alter the function signature to describe what the function actually does. This is a breaking change because TypeScript would start (rightfully) returning lots of errors in places where these functions are used.

Because this release introduces other breaking changes, and because adapting our own codebase to this change showed it made more sense, we decided to adopt the latter option.

:::tip

In many cases where data needs to be discriminated, this change in the signature of the `is*` function won't actually cause any issues when upgrading the version of the SDK.

:::

For example, this is the case when working with data obtained from the API. Because an API is a "contract" between a server and a client, **the data returned by Bluesky's server APIs is "guaranteed" to be valid.** In these cases, the `is*` utility methods provide a convenient way to discriminate between valid values.

```typescript
import { AppBskyEmbedImages } from '@atproto/api'

// Get a post from the API (the API's contract
// guarantees the validity of the data)
declare const post: AppBskyEmbedImages.Main

// The `is*` utilities are an efficient way to
// discriminate **valid** data based on their `$type`
if (isImages(post.embed)) {
  // `post.embed` is fully typed as
  // `$Typed<AppBskyEmbedImages.Main>` here!
}
```

### `validate*` utility methods

As part of this update, the signature of the `validate*` utility methods was updated to properly describe the type of the `value` in case of success:

```typescript
import { AppBskyEmbedImages } from '@atproto/api'

// Aliased for clarity
const Images = AppBskyEmbedImages.Main
const validateImages = AppBskyEmbedImages.validateMain

// Get some data somehow
declare const data: unknown

// Validate the data against a particular schema (images here)
const result = validateImages(data)

if (result.success) {
  // The `value` property was previously typed as `unknown`
  // and is now properly typed as `Image`
  const images = result.value
}
```

These methods perform data validation, making them somewhat slower than the `is*` utility methods. They can, however, be used in place of the `is*` utilities when migrating to this new version of the SDK.

### New `asPredicate` function

The SDK exposes a new `asPredicate` function. This function allows converting a `validate*` function into a predicate function. This can be useful when working with libraries that expect a predicate function to be passed as an argument.

```typescript
import { asPredicate, AppBskyEmbedImages } from '@atproto/api'

// Aliased for clarity
const Images = AppBskyEmbedImages.Main
const isValidImages = asPredicate(AppBskyEmbedImages.validateMain)

// Get an embed with unknown validity somehow
declare const embed: unknown

// The following condition will be true if, and only
// if, the value matches the `Image` interface.
if (isValidImages(embed)) {
  // `embed` is of type `Images` here
}

// Similarly, the type predicate can be used to
// infer the type of an array of unknown values:
declare const someArray: unknown[]

// This will be typed as `Images[]`
const images = someArray.filter(isValidImages)
```

:::note
We decided to introduce the `asPredicate` function to provide an explicit way to convert `validate*` functions into predicate functions. More importantly, this function allowed us limit the bundle size increase that would have been caused by the introduction new `isValid*` utility methods as part of this release.
:::

## Removal of the `[x: string]` index signature

Another property of Atproto being an "open protocol" is the fact that objects are allowed to contain additional &mdash; unspecified &mdash; properties (although this should be done with caution to avoid incompatibility with properties that are added in the future). This used to be represented in the type system using a `[k: string]: unknown` index signature in generated interfaces. This is how the video embed used to be represented:

```typescript
export interface Main {
  video: BlobRef
  captions?: Caption[]
  alt?: string
  aspectRatio?: AppBskyEmbedDefs.AspectRatio
  [k: string]: unknown
}
```

This signature allowed for undetectable mistakes to be performed:

```typescript
import { AppBskyEmbedVideo } from '@atproto/api'

const embed: AppBskyEmbedVideo.Main = {
  $type: 'app.bsky.embed.video',
  video: {
    /* omitted */
  },

  // Notice the typo in `alt`, not resulting in a TypeScript error
  atl: 'My video',
}
```

We removed that signature, requiring any unspecified fields intentionally added to be now explicitly marked as such:

```typescript
import { AppBskyEmbedVideo } from '@atproto/api'

const embed: AppBskyEmbedVideo.Main = {
  $type: 'app.bsky.embed.video',
  video: {
    /* omitted */
  },

  // Next line will result in the following
  //  TypeScript error: "Object literal may only
  // specify known properties, and 'atl' does not
  // exist in type 'Main'"
  atl: 'My video',

  // Unspecified fields must now be explicitly
  // marked as such:

  // @ts-expect-error - custom field
  comExampleCustomProp: 'custom value',
}
```

## Other considerations

When upgrading, please make sure that your project does not depend on multiple versions of the `@atproto/*` packages. Use [resolutions](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/) or [overrides](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides) in your `package.json` to pin the dependencies to the same version.

## Recap

We hope this release helps you build better codebases with improved type safety. During our own migration, we found and fixed a few small bugs, and we believe these changes will benefit the entire developer community.

### Migration TL;DR:

- Need to be absolutely sure of your data? Use `asPredicate` or `validate*` utilities.
- Using data from the Bluesky app view? You can use `is*` utilities.
- Building lex objects for writing? Make sure you use `$Typed` when building those.

Happy coding!
