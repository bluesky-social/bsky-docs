---
slug: repo-sync-update
title: Updates to Repository Sync Semantics
---

We’re excited to announce that we’re rolling out a new version of atproto [repositories](https://atproto.com/guides/data-repos) that removes history from the canonical structure of repositories, and replaces it with a logical clock. We’ll start rolling out this update next week (August 28, 2023).

For most developers with projects subscribed to the [firehose](https://atproto.com/community/projects#firehose), such as feed generators, this change shouldn’t affect you. These will only affect you if you’re doing commit-aware repo sync (a good rule of thumb is if you’ve ever passed `earliest` or `latest` to the `com.atproto.sync.getRepo` method) or are explicitly checking the repo version when processing commits.
