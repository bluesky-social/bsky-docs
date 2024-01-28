---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Custom feeds

Custom feeds are algorithmic feed generators. To users, this is their timeline. This tutorial will explain how to interact with a feed generator in the network.

:::tip
Anybody can create custom feed. See the [Custom Feeds Starter Template](/docs/starter-templates/custom-feeds) to get started.
:::

## Getting a feed generator's description

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    Call [app.bsky.feed.getFeedGenerator](/docs/api/app-bsky-feed-get-feed-generator) to view a feedgen's description.

    ```ts
    agent.app.bsky.feed.getFeedGenerator({
      feed: feedUri
    })
    ```

    The output will match this interface:

    ```ts title="getFeedGenerator() output"
    {
      view: { // AppBskyFeedDefs.GeneratorView 
        uri: string;
        cid: string;
        did: string;
        creator: AppBskyActorDefs.ProfileView;
        displayName: string;
        description?: string;
        descriptionFacets?: AppBskyRichtextFacet.Main[];
        avatar?: string;
        likeCount?: number;
        viewer?: GeneratorViewerState;
        indexedAt: string;
      }
      isOnline: boolean;
      isValid: boolean;
    }
    ```
  </TabItem>
</Tabs>

## Viewing a feed generator's posts

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    Call [app.bsky.feed.getFeed](/docs/api/app-bsky-feed-get-feed) to view posts from a feedgen.

    ```ts
    agent.app.bsky.feed.getFeed({
      feed: feedUri,
      limit: 30,
      cursor
    })
    ```

    The output will match this interface:

    ```ts title="getFeed() output"
    {
      cursor?: string;
      feed: AppBskyFeedDefs.FeedViewPost[];
    }
    ```

    Use the returned cursor to fetch additional pages of posts.
  </TabItem>
</Tabs>

## Has the user liked a feedgen?


<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    When you call [app.bsky.feed.getFeedGenerator](/docs/api/app-bsky-feed-get-feed-generator), you can examine the `viewer` field to determine if the user has liked the feedgen.

    ```ts title="viewer object"
    {
      like?: string; // the URI of the like record if liked
    }
    ```

    For example:

    ```ts
    const res = await agent.app.bsky.feed.getFeedGenerator({
      feed: feedUri
    })
    if (res.data.list.viewer?.like) {
      // has liked list
    }
    ```
  </TabItem>
</Tabs>

## Liking and unliking a feedgen

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    Liking a feed is the same as liking any other item in the network. You just use the URI and CID of the feed generator to identify the feed.

    ```ts
    const {data: feedInfo} = agent.app.bsky.feed.getFeedGenerator({
      feed: feedUri
    })
    await agent.like(feedUri, feedInfo.view.cid)
    ```

    Unliking a feed works the same way:
    
    ```ts
    const {data: feedInfo} = agent.app.bsky.feed.getFeedGenerator({
      feed: feedUri
    })
    await agent.unlike(feedInfo.view.viewer.like)
    ```
  </TabItem>
</Tabs>
