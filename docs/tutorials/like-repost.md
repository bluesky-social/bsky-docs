---
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Liking and reposting

Liking and reposting posts are a core feature of Bluesky and our SDK has
dedicated methods for these actions.

## Liking a post

Liking a post requires the post's URI and its CID. The CID is used to [INSERT
WHY].

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.like"
      const { uri } = await agent.like(uri, cid)
    ```
  </TabItem>
</Tabs>

| Parameter | Type     | Description         | Required |
| --------- | -------- | ------------------- | -------- |
| `uri`     | `string` | The URI of the post | Yes      |
| `cid`     | `string` | The CID of the post | Yes      |

## Un-liking a post

And un-liking a post requires only the post's URI, which refers to its record.
In the case of a Like, un-liking the post means deleting the Like record.

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.deleteLike"
      await agent.deleteLike(uri)
    ```
  </TabItem>
</Tabs>

| Parameter | Type     | Description                    | Required |
| --------- | -------- | ------------------------------ | -------- |
| `uri`     | `string` | The URI of the post to un-like | Yes      |

## Reposting a post

Reposting and un-reposting looks almost exactly the same as liking and
un-liking.

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.repost"
      const { uri } = await agent.repost(uri, cid)
    ```
  </TabItem>
</Tabs>

| Parameter | Type     | Description         | Required |
| --------- | -------- | ------------------- | -------- |
| `uri`     | `string` | The URI of the post | Yes      |
| `cid`     | `string` | The CID of the post | Yes      |

## Un-reposting a post

Same as un-like, un-reposting a post requires only the post's URI, whose record
we want to delete.

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.deleteRepost"
      await agent.deleteRepost(uri)
    ```
  </TabItem>
</Tabs>

| Parameter | Type     | Description                      | Required |
| --------- | -------- | -------------------------------- | -------- |
| `uri`     | `string` | The URI of the post to un-repost | Yes      |

## Quote reposting

:::info
For information on quote posts, see the [Create a
post](/docs/tutorials/creating-a-post#quote-posts) tutorial.
:::
