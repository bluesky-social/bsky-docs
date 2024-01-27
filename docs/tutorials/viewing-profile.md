---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Viewing profiles

A profile is typically made up of a user's biographical information, and their
posts.

:::info
To learn how to fetch a user's posts, see the [Viewing
feeds](/docs/tutorials/viewing-feeds#author-feeds) tutorial under "Author
feeds".
:::

## Fetching a user's profile info

To fetch a user's profile info, you can use the `getProfile` method on your
Bluesky agent:

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.getProfile"
    const { data } = await agent.getProfile({ actor: 'did:plc:...' })
    const { did, displayName, ... } = data
    ```
  </TabItem>
</Tabs>

| Parameter | Type     | Description                                           | Required |
| --------- | -------- | ----------------------------------------------------- | -------- |
| `actor`   | `string` | The DID (or handle) of the user whose profile you'd like to fetch | Yes      |

## Fetching multiple profiles at once

Fetching multiple profiles is as easy as a single profile:

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.getProfiles"
    const { data } = await agent.getProfiles({ actors: ['did:plc:...', ...] })
    const { profiles } = data
    ```
  </TabItem>
</Tabs>

| Parameter | Type     | Description                                           | Required |
| --------- | -------- | ----------------------------------------------------- | -------- |
| `actors`   | `string[]` | The DIDs (or handles) of the users whose profiles you'd like to fetch | Yes      |
