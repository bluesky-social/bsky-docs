---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Thread gates

Thread gates set who can reply to a post.

The available rules are:

- **app.bsky.feed.threadgate#mentionRule**: Allow replies from actors mentioned in your post.
- **app.bsky.feed.threadgate#followingRule**: Allow replies from actors you follow.
- **app.bsky.feed.threadgate#listRule**: Allow replies from actors on a list.

A thread gate may have up to 5 rules.

## Setting a thread gate

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    You set a thread gate by creating a **app.bsky.feed.threadgate** record with the same rkey as the post you're gating.

    ```ts
    const {rkey} = new AtUri(postUri)

    await agent.com.atproto.repo.createRecord({
      repo: agent.session.did,
      collection: 'app.bsky.feed.threadgate',
      rkey,
      record: {
        $type: 'app.bsky.feed.threadgate',
        post: postUri,
        allow: [
          // allow mentioned users
          {$type: 'app.bsky.feed.threadgate#mentionRule'},
          // allow followed users
          {$type: 'app.bsky.feed.threadgate#followingRule'},
          // allow list members
          {$type: 'app.bsky.feed.threadgate#listRule', list: listUri},
        ],
        createdAt: new Date().toISOString()
      }
    })
    ```

    If a thread gate record is present but empty, then nobody can reply.

    ```ts
    await agent.com.atproto.repo.createRecord({
      repo: agent.session.did,
      collection: 'app.bsky.feed.threadgate',
      rkey,
      record: {
        $type: 'app.bsky.feed.threadgate',
        post: postUri,
        // empty allow-list, nobody can reply
        allow: [],
        createdAt: new Date().toISOString()
      }
    })
    ```

    If a thread gate record is not present, then anybody can reply.
  </TabItem>
</Tabs>