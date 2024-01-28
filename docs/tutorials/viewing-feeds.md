---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Viewing feeds

Feeds are lists of posts, paginated by cursors. Bluesky has a few types of feeds:

- **timelines**: the default chronological feed of posts from users the authenticated user follows
- **feed generators**: custom feeds made by users and organiziations
- **author feeds**: a feed of posts by a single author

## Viewing a user's timeline

The Bluesky agent you created in the [Get Started](/docs/get-started) section has a dedicated `getTimeline` method that returns the authenticated user's timeline. It accepts two parameters: `cursor` and `limit`.

| Parameter | Type     | Description                                           | Required | Default |
| --------- | -------- | ----------------------------------------------------- | -------- | ------- |
| `cursor`  | `string` | A cursor that tells the server where to paginate from | No       | `''`    |
| `limit`   | `number` | The number of posts to return per page (max `100`)    | No       | `50`    |

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.getTimeline"
    const { data } = await agent.getTimeline({
      cursor: "...",
      limit: 30,
    });

    const { feed: postsArray, cursor: nextPage } = data;
    ```

  </TabItem>
</Tabs>

## Feed generators

Feed generators (custom feeds) are created by users and organizations, and are therefore tied to an account via its DID. References to feed generators take the form of a URI with the following shape:

```
at://<did>/app.bsky.feed.generator/<record_key>
```

To fetch a feed generator, use the `getFeed` method on the `app.bsky.feed`
namespace on your Bluesky agent. The method accepts the following parameters

| Parameter | Type     | Description                                           | Required | Default |
| --------- | -------- | ----------------------------------------------------- | -------- | ------- |
| `feed`    | `string` | The URI of the feed generator to fetch                | Yes      |         |
| `cursor`  | `string` | A cursor that tells the server where to paginate from | No       | `''`    |
| `limit`   | `number` | The number of posts to return per page (max `100`)    | No       | `50`    |

In the example below, we fetch the first 30 posts from the ["Discover"
custom feed](https://bsky.app/profile/bsky.app/feed/whats-hot).

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.app.bsky.feed.getFeed"
    const { data } = await agent.app.bsky.feed.getFeed(
      {
        feed: "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot",
        limit: 30,
      },
      {
        headers: {
          "Accept-Language": preferredLanguages,
        },
      },
    );

    const { feed: postsArray, cursor: nextPage } = data;
    ```

  </TabItem>
</Tabs>

:::tip
We recommend sending the `Accept-Language` header to get posts in the user's preferred language. This header accepts a comma separated string of two-character language codes, e.g. `en,es`.
:::

Feed generators are also described by data accessible via the `getFeedGenerator`
method also on the `app.bsky.feed` namespace. This method returns metadata about
the feed generator, including its name, description, etc. It accepts a single
parameter, `feed`, which is the URI of the feed generator to fetch.

| Parameter | Type     | Description                            | Required | Default |
| --------- | -------- | -------------------------------------- | -------- | ------- |
| `feed`    | `string` | The URI of the feed generator to fetch | Yes      |         |

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.app.bsky.feed.getFeedGenerator"
    const { data } = await agent.app.bsky.feed.getFeedGenerator({
      feed: "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot",
    });

    const { creator, displayName, description, avatar, likeCount } = data.view;
    ```

  </TabItem>
</Tabs>

## Author feeds

Author feeds return posts by a single user.

| Parameter | Type     | Description                                             | Required | Options                                                                                  | Default              |
| --------- | -------- | ------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- | -------------------- |
| `actor`   | `string` | The DID of the author whose posts you'd like to fetch   | Yes      |                                                                                          |                      |
| `filter`  | `string` | The type of posts you'd like to receive in the response | No       | `posts_with_replies`, `posts_no_replies`, `posts_with_media`, `posts_and_author_threads` | `posts_with_replies` |
| `cursor`  | `string` | A cursor that tells the server where to paginate from   | No       |                                                                                          | `''`                 |
| `limit`   | `number` | The number of posts to return per page (max `100`)      | No       |                                                                                          | `50`                 |

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.getAuthorFeed"
    const { data } = await agent.getAuthorFeed({
      actor: 'did:plc:z72i7hdynmk6r22z27h6tvur',
      filter: 'posts_and_author_threads',
      limit: 30,
    });

    const { feed: postsArray, cursor: nextPage } = data;
    ```

  </TabItem>
</Tabs>
