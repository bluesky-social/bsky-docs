---
slug: api-v0-14-0-release-notes
title: '@atproto/api v0.14.0 release notes'
tags: ['updates', 'guide']
---

Today we are excited to announce the availability of version 0.14 or our TypeScript SDK on [NPM](https://www.npmjs.com/package/@atproto/api).

This release is a big step forward, significantly improving the type safety of our `@atproto/api` package. Let’s take a look at the highlights:

- Lexicon derived interfaces now have an explicitly defined `$type` property, allowing to properly discriminate unions.
- Lexicon derived `is*` utility methods no longer unsafely type cast their input.
- Lexicon derived `validate*` utility methods now return a more precise type.
- A new lexicon derived `isValid*` utility methods are now available.

## Context

Atproto is an "open protocol". This means a lot of things. One of these things is that the data structures handled through the protocol are extensible. Lexicons (which is the syntax used to define the schema of the data structures) can be used to describe placeholders where arbitrary data types (defined through third party Lexicons) can be used.

An example of such placeholder exists in the lexicon definition of a Bluesky post
([`app.bsky.feed.post`](https://github.com/bluesky-social/atproto/blob/5ece8c6aeab9c5c3f51295d93ed6e27c3c6095c2/lexicons/app/bsky/feed/post.json#L5-L64)). That schema defines that posts can have an `embed` property defined as follows:

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

The type of the `embed` property is what is called an "open union". It means that the `embed` field can basically contain anything, though we usually expect it to be one of the known types defined in the `refs` array of the lexicon schema (an image, a video, a link or another post).

Systems consuming Bluesky posts need to be able to determine what type of embed they are dealing with. This is where the `$type` property comes in. This property allows to uniquely determine the lexicon schema that must be used to interpret the data. That field **must** be provided everywhere a union is expected. For example, a post with a video would look like this:

```javascript
{
  "text": "Hey, check this out!",
  "createdAt": "2021-09-01T12:34:56Z",
  "embed": {
    "$type": "app.bsky.embed.video",
    "video": { /* reference to the video file, omitted for brevity */ }
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

> Note: Only systems that know about the `com.example.calendar.event` lexicon can interpret this data. The official Bluesky app will typically only know about the data types defined in the `app.bsky` lexicons.

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

// Aliased for clarity
type BlueskyPost = AppBskyFeedPost.Main

// Invalid post, but TypeScript did not complain
const myPost: BlueskyPost = {
  text: 'Hey, check this out!',
  createdAt: '2021-09-01T12:34:56Z',
  embed: {
    // Notice how we are missing the `$type` property here
    video: {
      /* reference to the video file, omitted for brevity */
    },
  },
}
```

Similarly, because Bluesky post’s `embed` property was previously [typed](https://github.com/bluesky-social/atproto/blob/5ece8c6aeab9c5c3f51295d93ed6e27c3c6095c2/packages/api/src/client/types/app/bsky/feed/post.ts#L25-L31) like this:

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

It was possible to create a post with a completely invalid "video" embed, and still get no error from the type system:

```typescript
import { AppBskyFeedPost } from '@atproto/api'

// Aliased for clarity
type BlueskyPost = AppBskyFeedPost.Main

const myPost: BlueskyPost = {
  text: 'Hey, check this out!',
  createdAt: '2021-09-01T12:34:56Z',
  embed: {
    $type: 'app.bsky.embed.video',
    video: 43, // This is invalid, but TypeScript does not complain
  },
}
```

We have fixed these issues by making the `$type` property in the generated interfaces explicit. The `app.bsky.embed.video` interface now looks like this:

```typescript
export interface Main {
  $type?: $Type<'app.bsky.embed.video', 'main'>
  video: BlobRef
  captions?: Caption[]
  alt?: string
  aspectRatio?: AppBskyEmbedDefs.AspectRatio
}
```

Notice how the `$type` property is defined as optional (`?:`) here. This is due to the fact that lexicons can define schemas that can be referenced from other places than open unions. In those places, there might not be any ambiguity as to how the data should be interpreted. For example, an embed that represents a "Record With Media" has a `record` property that expects an `app.bsky.embed.record` object:

```typescript
export interface Main {
  $type?: $Type<'app.bsky.embed.recordWithMedia', 'main'>
  record: AppBskyEmbedRecord.Main // Also used in post's `embed` property
  media: /* omitted */
}
```

Since there is no ambiguity as to the type of the data here, making the `$type` property required would cause unnecessary bloat. Making the `$type` property optional allows to declare a "Record With Media" as follows:

```typescript
const recordWithMedia: RecordWithMedia = {
  $type: 'app.bsky.embed.recordWithMedia',
  record: {
    // $type is not needed here
    record: {
      /* omitted */
    },
  },
  media: {
    /* omitted */
  },
}
```

Because the `$type` property of objects is required in some contexts while optional in others, we introduced a new utility type to make it required when needed. The `$Typed` utility allows to mark an interface’s `$type` property non optional in contexts where it is required:

```typescript
export type $Typed<V> = V & { $type: string }
```

That utility allows to mark an interface’s `$type` property non optional. The `embed` property of posts is now defined as follows:

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

In addition to preventing the _creation_ of invalid data as seen at the beginning of this section, this change also allows to properly discriminate types when _accessing_ the data. For example, one can now do:

```tsx
import { AppBskyFeedPost } from '@atproto/api'

// Aliased for clarity
type BlueskyPost = AppBskyFeedPost.Main

// Say we got some random post somehow (typically via an api call)
declare const post: BlueskyPost

// And we want to know what kind of embed it contains
const { embed } = post

// We can now use the `$type` property to disambiguate
if (embed?.$type === 'app.bsky.embed.images') {
  // The `embed` variable is fully typed as `$Typed<AppBskyEmbedImages.Main>` here !
}
```

### `is*` utility methods

The example above shows how data can be discriminated based on the `$type` property. There are, however, several disadvantages to relying on string comparison for discriminating data types:

- Having to use inline strings yields a lot of code, hurting readability and bundle size.
- In particular instances, the `$type` property can actually have two values to describe the same lexicon. An "images" embed, for example, can use both `app.bsky.embed.images` and `app.bsky.embed.images#main` as `$type`. This makes the previous point even worse.

In order to alleviate these issues, the SDK provides type checking predicate functions. In their previous implementation, the `is*` utilities were defined as follows:

```typescript
export interface Main {
  images: Image[]
  [x: string]: unknown
}

export function isMain(value: unknown): values is Main {
  return (
    value != null &&
    typeof value === 'object' &&
    '$type' in value &&
    (value.$type === 'app.bsky.embed.images' ||
      value.$type === 'app.bsky.embed.images#main')
  )
}
```

As can be seen from the example implementation above, the predicate functions would cast any object containing the expected `$type` property into the corresponding type, without checking for the actual validity of other properties. This could yield runtime errors that could have been avoided during development:

```typescript
import { AppBskyEmbedImages } from '@atproto/api'

// Alias, for clarity
const isImages = AppBskyEmbedImages.isMain

// Get an invalid embed somehow
const invalidEmbed = {
  $type: 'app.bsky.embed.images',
  // notice how the `images` property is missing here
}

// This predicate function only checks the value of the `$type` property, making the condition "true" here
if (isImages(invalidEmbed)) {
  // No TypeScript error, BUT causes a runtime error because there is no "images" property !
  console.log('First image:', invalidEmbed.images[0])
}
```

The root of the issue here is that the `is*` utility methods perform type casting of objects solely based on the value of their `$type` property. There were basically two ways of fixing this issue:

1. Alter the implementation to actually validate the object's structure. This is a non breaking change that has a big negative impact on performances.
2. Alter the function signature to describe what the function actually does. This is a breaking change because TypeScript would start (rightfully) returning lots of errors in places where these functions are used.

Because this release introduces other breaking changes, and because adapting our own code base to this change showed it made more sense, we decided to adopt the latter option.

In lots of cases where data needs to be discriminated, this change in the signature of the `is*` function will actually not cause any issue when upgrading the version of the SDK. This is the case for example when working with data obtained from the API. Because an API is a "contract" between a server and a client, the data returned by the server is "guaranteed" to be valid. In these cases, the `is*` utility methods provide a convenient way to discriminate between valid values.

```typescript
import { AppBskyEmbedImages } from '@atproto/api'

// Aliased for clarity
const isImages = AppBskyEmbedImages.isMain

// Get a post from the API (the API's contract guarantees the validity of the data)
declare const post: BlueskyPost

// The `is*` utilities are an efficient way to discriminate **valid** data based on their `$type`
if (isImages(post.embed)) {
  // `post.embed` is fully typed as `$Typed<AppBskyEmbedImages.Main>` here !
}
```

For other cases, when the data's validity is not known at dev time, we added new `isValid*` utility methods allowing to ensure that a value properly satisfies the interface.

```typescript
import { AppBskyEmbedImages } from '@atproto/api'

// Aliased for clarity
const Images = AppBskyEmbedImages.Main
const isValidImages = AppBskyEmbedImages.isValidMain

// Get an embed with unknown validity somehow
declare const embed: unknown

// The following condition will be true if, and only if, the value matches the `Image` interface
if (isValidImages(embed)) {
  // `embed` is of type `Images` here
}
```

These method perform data validation, making them somewhat slower than the `is*` utility methods. They can however be used in place of the `is*` utilities when migrating to this new version of the SDK.

## `validate*` utility methods

As part of this update, the signature of the `validate*` utility methods was updated to properly describe the type of the `value` in case of success:

```typescript
import { AppBskyEmbedImages } from '@atproto/api'

// Aliased for clarity
const Images = AppBskyEmbedImages.Main
const validateImages = AppBskyEmbedImages.validateMain

// Get some date somehow
declare const data: unknown

// Validate the data against a particular schema (images here)
const result = validateImages(data)

if (result.success) {
  // The `value` property was previously typed as `unknown` and is now properly typed as `Image`
  const images = result.value
}
```

## Removal of the `[x: string]` index signature

Another property of Atproto being an "open protocol" is the fact that objects are allowed to contain additional, unspecified, properties (though this should be done with caution to avoid incompatibility with properties added in the future). This used to be represented in the type system using a `[k: string]: unknown` index signature in generated interfaces. This is how the video embed was represented:

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

// Aliased for clarity
const Video = AppBskyEmbedVideo.Main

const embed: Video = {
  $type: 'app.bsky.embed.video',
  video: { /* omitted */ }
  // Notice the typo in `alt`, not resulting in a TypeScript error
  atl: 'My video'
}
```

We removed that signature, requiring any un-specified fields intentionally added to be now explicitly marked as such:

```typescript
import { AppBskyEmbedVideo } from '@atproto/api'

// Aliased for clarity
const Video = AppBskyEmbedVideo.Main

const embed: Video = {
  $type: 'app.bsky.embed.video',
  video: { /* omitted */ }
  // @ts-expect-error - custom field, prefixed to avoid clashes with future versions of the lexicon
  comExampleCustomProp: 'custom value', // OK thanks to the "ts-expect-error" directive
}
```
