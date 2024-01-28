---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Viewing threads

A *thread* refers to a post, its replies (descendants), and its parents
(ancestors). Fetching a thread is done with the `getPostThread`` method, which accepts the following parameters:

| Parameter      | Type     | Description                                                 | Required | Default | Minimum | Maximum |
| -------------- | -------- | ----------------------------------------------------------- | -------- | ------- | ------- | ------- |
| `uri`          | `string` | The URI of the post whose thread you'd like to fetch        | Yes      |         |         |         |
| `depth`        | `number` | The _depth_ of the descendent post tree you'd like to fetch | No       | `6`     | `0`     | `1000`  |
| `parentHeight` | `number` | The _height_ of the ancestor post tree you'd like to fetch  | No       | `80`    | `0`     | `1000`  |

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.getPostThread"
      const res = await agent.getPostThread({uri: 'at://...'})
      const { thread } = res.data
    ```
  </TabItem>
</Tabs>

## Data shape

A thread response contains a root post along with its replies and its ancestors (if there are any). The response can be roughly described like this:

```
interface ThreadViewPost {
    post: PostView;
    parent?: ThreadViewPost | NotFoundPost | BlockedPost | {
        $type: string;
        [k: string]: unknown;
    };
    replies?: (ThreadViewPost | NotFoundPost | BlockedPost | {
        $type: string;
        [k: string]: unknown;
    })[];
}
```

Here, the `post` is the "root" — whose URI you provided the `getPostThread`
method. The `parent` is a nested tree of ancestors (if any), and the `replies`
is a one-dimentional array of replies (if any).

Because `replies` is one-dimensional, to facilitate the construction of a tree
from this data, each reply object in the array contains references to its
immediate parent (ancestor) and immediate child (descendent).

### The `depth` and `parentHeight` parameters

`depth` and `parentHeight` can be thought of as the distance from the
root post to its most distant child or parent.

```
root
├── child 1
│   ├── child 1.1
│   │   └── child 1.1.1
│   └── child 1.2
└── child 2
    └── child 2.1
        └── child 2.1.1
```

Above, if we were to fetch the `root` post, `child 1.2` is at a depth of `2`
from the `root`, its ancestor. If we were to fetch `child 2.1.1` directly,
`root` would be at a height of `3` from `child 2.1.1`, its descendent.

## Handling blocks, takedowns, and not found

As you can see in the types above, any post object in the response can be either
a valid `ThreadViewPost`, a `NotFoundPost`, or a `BlockedPost`.

A `NotFoundPost` is returned when the post either does not exist, has been
deleted by its author, or has been taken down by a moderation service.

These posts are included in the response so that a complete tree can be
constructed. It's up to the end developer to decide how to render these
different states.
