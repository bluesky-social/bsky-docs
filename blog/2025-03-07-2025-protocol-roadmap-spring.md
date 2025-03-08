---
slug: 2025-protocol-roadmap-spring
title: 2025 Protocol Roadmap (Spring and Summer)
tags: ['updates']
---

*Join the [Github](https://github.com/bluesky-social/atproto/discussions/3616) discussion here.*

Metamorphosis is the process where a caterpillar forms a chrysalis, liquifies its own body, and emerges as an imago, or butterfly. It is a pretty nifty trick. Anyways, trees are budding, Lexicons are blossoming, spring is happening, and it is time for an update to the AT Protocol roadmap.

We recently [summarized progress on the protocol in 2024](https://docs.bsky.app/blog/looking-back-2024). This blog post will be forward looking, covering our protocol goals for the next 6-7 months. As a high-level summary:

- Updates to the relay, firehose, and public repo sync semantics ([Sync v1.1](https://github.com/bluesky-social/proposals/tree/main/0006-sync-iteration)) are starting to roll out
- Design work on Auth Scopes has started, which will improve atproto OAuth
- PDS will get a web interface for generic account management and signup
- Shared data (eg, group privacy) will likely be the next major protocol component, with E2EE DMs following that

We also have a quick section on deprecated developer patterns; please give those a look\!

## Sync v1.1

We are iterating on the core public data synchronization components of the protocol. Relays will become much cheaper to operate, and we’re clarifying the process for fully validating the firehose. The [full proposal](https://github.com/bluesky-social/proposals/tree/main/0006-sync-iteration) gets into all the details, but to summarize:

- Efficient mechanism for validating MST operations in individual repository commits ("inductive firehose")
- Adding a new `#sync` message type, and removing the `tooBig` flag on commits
- New `desynchronized` and `throttled` account statuses, to communicate temporary failures
- New `com.atproto.sync.listReposByCollection` endpoint to help with backfill

## Auth Scopes

We are updating [OAuth for AT Protocol](https://docs.bsky.app/blog/oauth-atproto) with a way to request and grant granular permissions. For example, it should be possible to give a client permission to read and write posts on Bluesky, but not insert arbitrary block records or access DMs. This is obviously important for user control, privacy, and account security.The system will allow application designers to declare their own auth scopes, as part of the Lexicon system. PDS implementations will be able to enforce these permissions in an interoperable way, at runtime. We will share more details soon.

In addition to completing OAuth for existing apps, Auth Scopes will be necessary for upcoming protocol features, like group-private data and on-protocol DMs.

## PDS Account Management

More and more folks are building independent apps on atproto. While they can use OAuth to authenticate users from any PDS instance, account signup is more complicated. In theory it is possible to implement account creation using the `com.atproto.*` Lexicons, but in practice this is difficult (or impossible) to implement in independent apps, because of anti-bot measures. This results in developers directing new users to sign up with Bluesky,, which is a bad user experience, and conflates having an account on the AT Protocol with having a Bluesky account.

To improve this situation, we are implementing a web interface in the PDS reference distribution which will give users a less-branded account sign-up experience. The PDS technically already has a web interface, used for the OAuth authorization flow, and this simply extends that. Over time, we expect the web interface to provide generic account management capabilities, such as password recovery flows, additional 2FA mechanisms, management of active auth sessions, account deactivation, etc.

The details of the web interface will be implementation-specific. Other PDS implementations might provide different functionality, or make different design choices.

## Privately Shared Data and E2EE DMs

We believe that robust support for group-private data will be necessary for the long-term success of the protocol (and for apps built on the protocol). Similarly, the ability to share private content with a specific group or audience continues to be a top feature request for both the AT Protocol and the Bluesky app. Just as we’re currently doing with public conversation on the Bluesky app and the AT Protocol, we also want to co-design the protocol specification for private data in tandem with specific real-world product features: this results in better outcomes for both. Designing for privacy is pretty different from designing for global broadcast, and we think the data architecture will probably look pretty different from the MST \+ firehose system.

Shared data will depend on Auth Scopes, and we don't expect to start design work until that is complete.

Looking forward, we continue to have plans to implement on-protocol DMs and E2EE group chat. However, we don’t expect to start work on this until after shared data is implemented. Meanwhile, there has been exciting progress in the broader tech world around the Messaging Layer Security (MLS) standard, and we are optimistic that we will be able to build on reusable components and design patterns when the time comes. It is also possible (and exciting\!) that the atproto dev community will experiment and build E2EE chat apps off-protocol before there is an official specification.

## Deprecations

There are a few protocol features and API endpoints which were supported in early days of atproto development. They have been deprecated for some time, but have continued to function. As the protocol stabilizes, we want to ensure developers are building against the current protocol, and will start to remove this functionality more aggressively.

A simple deprecation are the `#tombstone`, and `#handle`, and `#migrate` events on the firehose. These were replaced with `#identity` and `#account` early last year (2024), and have been deprecated since then. We will remove them from the atproto Lexicons entirely soon.

Client apps should resolve user login identifiers (handles or DIDs) to PDS instances, and should not hardcode the `bsky.social` domain for API requests. In the early days, all API requests could be made to this server, and we have continued to proxy requests to avoid breakage. Most clients and SDKs have been updated, and we may stop proxying in the near future.

When making proxied requests to a PDS, clients can specify a remote service to forward to via the `atproto-proxy` header. To date, the reference PDS implementation has automatically forwarded `app.bsky.*` endpoints to the Bluesky API server (`api.bsky.app`). No other services or Lexicon namespaces in the network have this sort of default forwarding. To keep the network more provider-neutral, clients should not rely on this default, and should always specify a service in the proxy header. The service DID reference for the Bluesky AppView is `did:web:api.bsky.app#bsky_appview`; you can see more example service DIDs in the [API Hosts and Auth](https://docs.bsky.app/docs/advanced-guides/api-directory) docs.

## Keep up with Ecosystem

The AT Protocol developer ecosystem continues to grow at a fast pace, with more developers launching new projects and organizations by the week. Here are some ways to stay updated or get involved:

- Follow the [@atproto.com](https://bsky.app/profile/atproto.com) Bluesky account
- Contribute to or read [discussions on Github](https://github.com/bluesky-social/atproto/discussions)
- Subscribe to the [The Fediverse Report](https://fediversereport.com/), an independent newsletter that includes weekly AT Protocol coverage
- Attend [atprotocol.dev](https://atprotocol.dev/)’s independently-run Tech Talks or the [ATmosphere Conference](https://atprotocol.dev/atmosphereconf/) this month in Seattle
