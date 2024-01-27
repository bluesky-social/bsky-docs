---
sidebar_position: 8
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Muting users

Muting a user hides their posts from your feeds. Mutes are private, and stored
on your PDS. Muting a user is as easy as liking a post or following a user.

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.mute"
      await agent.mute(did)
    ```
  </TabItem>
</Tabs>

| Parameter | Type     | Description                 | Required |
| --------- | -------- | --------------------------- | -------- |
| `did`     | `string` | The DID of the user to mute | Yes      |

## Unmuting a user

Easy peasy:

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.mute"
      await agent.unmute(did)
    ```
  </TabItem>
</Tabs>

| Parameter | Type     | Description                    | Required |
| --------- | -------- | ------------------------------ | -------- |
| `did`     | `string` | The DID of the user to un-mute | Yes      |
