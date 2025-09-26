---
slug: incoming-migration
title: Enabling Account Migration Back to Bluesky’s PDS
tags: ['federation', 'updates']
---

One of the core promises of AT is seamless account migration between PDS hosts. Since federation opened up in the AT network, it has been possible to migrate away from the Bluesky PDS and between non-Blueksky PDSs. However, once you left the Bluesky PDS, returning wasn’t an option.

Today, we’re removing that restriction and allowing returning users to migrate back to the Bluesky PDS. We hope this gives more users the confidence to explore other PDSs in the network, knowing they can return if needed. That being said, account migration remains a potentially destructive operation, so users should be aware of the risks before migrating between hosts.

This does not yet allow users who have never had a `bsky.social` account to migrate to our PDS. The migration flow works the same as described in the [Account Migration](https://github.com/bluesky-social/pds/blob/main/ACCOUNT_MIGRATION.md) documentation, but instead of creating a new account, you’ll log into your existing `bsky.social` account, import your repo, and reactivate. The Bluesky PDS will automatically handle the diff and index any changes to the repository since you were last active on `bsky.social`.

We want to see more PDSs in the network and more users on non-Bluesky PDSs. Future work includes an account migration tool hosted at `bsky.social`, improvements to the PDS distribution - especially for mid-sized deployments, and auto-scaling rate limits at the Relay.
