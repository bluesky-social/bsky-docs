---
slug: relay-sync-updates
title: Relay Updates for Sync v1.1
tags: ['firehose']
---

We have an updated relay implementation which incorporates Sync v1.1 protocol changes, and are preparing to switch over the `bsky.network` relay operated by Bluesky. This post describes new infrastructure developers can start using today and describes our plan for completing the migration.

## Updated Relay Implementation

The new version of the relay is available now in the [`indigo` go git repository](https://github.com/bluesky-social/indigo/tree/main/cmd/relay), named simply `relay`. It is a fork and refactor of the `bigsky` relay implementation, and several components have stuck around. The biggest change is that the relay no longer mirrors full repository data for all accounts in the network: sync v1.1 relays are now "non-archival". We have actually been operating `bsky.network` with a patched non-archival version of `bigsky` for some time, but this update includes a number of other changes:

- the new `#sync` message type is supported  
- the deprecated `#handle`, `#migration`, and `#tombstone` message types are fully removed (they were replaced with `#identity` and `#account`)  
- the sync v1.1 changes to the `#commit` message schema are supported  
- message validation and data limits updated to align with written specification  
- account hosting status and lifecycle updated to match written specification  
- `#commit` messages validated with MST inversion (controlled by "lenient mode" flag)  
- new `com.atproto.sync.listHosts` endpoint to enumerate subscribed PDS instances  
- `com.atproto.sync.getRepo` endpoint implemented as HTTP redirect to PDS instance  
- simplified configuration, operation, and SQL database schemas

The relay can aggregate firehose messages for the full atproto network on a relatively small and inexpensive server, even with signature validation and MST inversion of every message on the firehose. The relay can handle thousands of messages per second using on the order of 2 vCPU cores, 12 GByte of RAM, and 30 Mbps of inbound and outbound bandwidth. Disk storage depends on the length of the configurable "backfill window." (A 24-hour backfill currently requires a couple hundred GByte of disk.)

## Staged Rollout

The end goal is to upgrade the `bsky.network` relay instance and for all active PDS hosts in the network to emit valid Sync v1.1 messages. We are rolling this out in stages to ensure that no active services in the network break.

We have two new production relay instances:

- `relay1.us-west.bsky.network`  
- `relay1.us-east.bsky.network`

These both run the new relay implementation and attempt to crawl the entire atproto network. The two instances are operationally isolated and subscribe to PDS instances separately, though configuration will be synchronized between them periodically. They have sequence numbers which started at `20000000000` (20 billion) to distinguish them from the current `bsky.network` relay, which has a sequence around `8400000000` (8.4 billion). Note that the two new relays are independent from each other, have different sequence numbers, and will have different ordering of messages. Clients subscribing to these public hostnames will technically connect to `rainbow` daemons which fan-out the firehose.

We encourage service operators and protocol developers to experiment with these new instances. They are running in "lenient" MST validation mode and should work with existing PDS instances and implementations. PDS hosts can direct requestCrawl API requests to them. If hosts don't show up in listHosts, try making some repo updates to emit new `#commit` messages. Bluesky intends to operate both of these relays, at these hostnames, for the foreseeable future.

For the second stage of the roll-out (in the near future), we will update the `bsky.network` domain name to point at one of these new relay instances. If all goes smoothly, firehose consumers will simply start receiving events with a higher sequence number.

As a final stage, we will re-configure both instances to enforce MST inversion more strictly and drop `#commit` messages which fail validation. To ensure this does not break active hosts and accounts in the network, the relays currently attempt strict validation on every message and log failures (even if they are passed through on the firehose in "lenient" mode). We will monitor the logs and work with PDS operators who have not upgraded. If necessary, we can "ratchet" validation by host, meaning that new hosts joining the network are required to validate but specific existing hosts are given more time to update.

## Other Sync v1.1 Progress

We have a few resources for PDS developers implementing Sync v1.1:

- the `goat` CLI tool has several `--verify` flags on firehose consumer command, which can be pointed at a local PDS instance for debugging  
- likewise the relay implementation can be running locally (eg, using sqlite) and pointed at a local PDS instance  
- interoperability test data in the [`bluesky-social/atproto-interop-tests`](https://github.com/bluesky-social/atproto-interop-tests) git repository, both for MST implementation details, and for commit proofs  
- the written specifications have not been updated yet, but the [proposal doc](https://github.com/bluesky-social/proposals/tree/main/0006-sync-iteration) is thorough and will be the basis for updated specs

While not strictly required by the protocol, both of the new relay hostnames support the `com.atproto.sync.listReposByCollection` endpoint (technically via the `collectiondir` microservice, not part of the relay itself). This endpoint makes it much more efficient to discover which accounts in the network have records of a given type and is particularly helpful for developers building new Lexicons and working with data independent of the `app.bsky.*` namespace.

The need for ordered repository CAR file exports has become more clear, and an early implementation was completed for the PDS reference implementation. That implementation is not performant enough to merge yet, and it may be some time before ordered CAR files are a norm in the network. The exact ordering also needs to be described more formally to ensure interoperation. Work has not yet started on the "partial synchronization" variant of `getRepo`, which will allow fetching a subset of the repository.
