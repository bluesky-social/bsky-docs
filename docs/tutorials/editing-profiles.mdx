---
sidebar_position: 6
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Editing profiles

An authenticated user can edit their profile, including updating their display
name, avatar, banner image, and bio.

Editing a profile works as an "upsert" operation. If the profile does not exist,
such as immediately after account creation, the profile will be created. And if
the profile already exists, you must merge in new values manually and return
result to be updated.

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.upsertProfile"
    await agent.upsertProfile(existingProfile => {
      const existing = existingProfile ?? {}

      existing.displayName = 'New display name who dis'
      existing.description = 'New bio who dis'

      return existing
    })
    ```
  </TabItem>
</Tabs>

:::tip
Only accounts with a valid profile are indexed for search. When creating a new
account, we recommend creating a minimal profile with `displayName` set to the
user's handle.
:::

## Updating profile avatar or banner

Images are handled as separate records by Bluesky, so adding or updating an
avatar or profile banner requires an additional step of uploading the image blob
to your PDS.

<Tabs groupId="sdk">
  <TabItem value="ts" label="Typescript">
    ```typescript title="agent.upsertProfile"
    const avatar = 'data:image/png;base64,...'

    await agent.upsertProfile(existingProfile => {
      const existing = existingProfile ?? {}

      const { data } = await agent.uploadBlob(convertDataURIToUint8Array(avatar), {
        encoding,
      })

      existing.avatar = data.blob

      return existing
    })
    ```
  </TabItem>
</Tabs>

:::info
Handling blobs is covered in more detail in the Advanced Tutorial [Records & Blobs](/docs/advanced-guides/records-and-blobs).
:::
