---
sidebar_position: 1
---

# The AT Protocol

Bluesky, the company, is building a protocol for public conversation that can make social networks work more like email, blogs, or phone numbers — the open systems that power the rest of our online lives. The Bluesky app is a microblogging client built on top of the AT Protocol.

## What's the AT Protocol?

The AT Protocol, or atproto, is a protocol for public conversation and an open-source framework for building social apps. It creates a standard format for user identity, follows, and data on social apps, allowing apps to interoperate and users to move across them freely. It is a federated network with account portability.

The goal of the AT Protocol is to allow modern social media and public conversation online to work more like the early days of the web, when anyone could put up a blog or use RSS to subscribe to several blogs. We believe this will unlock a new era of experimentation and innovation in social media. Researchers and communities will have the ability to jump in to help solve the problems social networks currently face, and developers will be able to experiment with many new forms of interaction.

This feature of “account portability” is one of the most important differences between apps built on the AT Protocol and other sites, but atproto also provides algorithmic choice and composable moderation.

## AT Protocol Basic Concepts

### Identity

Users are identified by domain names on the AT Protocol. These domains map to cryptographic URLs which secure the user's account and its data.

### Data repositories

User data is exchanged in signed data repositories. These repositories are collections of records which include posts, comments, likes, follows, media blobs, etc.

### Federation

The AT Protocol syncs the repositories in a federated networking model. Federation was chosen to ensure the network is convenient to use and reliably available. Repository data is synchronized between servers over standard web technologies (HTTP and WebSockets).

The three core services in our network are Personal Data Servers (PDS), Big Graph Services (BGS), and App Views. We're also working on feed generators and labelers.

The lower-level primitives that can get stacked together differently are the repositories, lexicons, and DIDs. We published an overview of our technical decisions around federation architecture [on our blog](https://blueskyweb.xyz/blog/5-5-2023-federation-architecture).

### Interoperation

A global schemas network called Lexicon is used to unify the names and behaviors of the calls across the servers. You can think of it as JSON over HTTP. Servers implement "lexicons" to support featuresets, including the core atproto Lexicon for syncing user repositories and the Bsky Lexicon to provide basic social behaviors.

While the Web exchanges documents, the AT Protocol exchanges schematic and semantic information, enabling the software from different orgs to understand each others' data. This gives atproto clients freedom to produce user interfaces independently of the servers, and removes the need to exchange rendering code (HTML/JS/CSS) while browsing content.

### Achieving scale

Personal data servers are your home in the cloud. They host your data, distribute it, manage your identity, and orchestrate requests to other services to give you your views.

Big Graph Services (BGS) handle all of your events, like retrieving large-scale metrics (likes, reposts, followers), content discovery (algorithms), and user search.

Running a PDS is relatively inexpensive. This distinction is intended to achieve scale as well as a high degree of user-choice.

### Algorithmic choice

As with Web search engines, users are free to select their aggregators. Feeds, App Views, and search indices can be provided by independent third parties, with requests routed by the PDS based on user configuration.

### Account portability

We assume that a Personal Data Server may fail at any time, either by going offline in its entirety, or by ceasing service for specific users. The goal of the AT Protocol is to ensure that a user can migrate their account to a new PDS without the server's involvement.

User data is stored in signed data repositories and verified by DIDs. Signed data repositories are like Git repos but for database records, and DIDs are essentially registries of user certificates, similar in some ways to the TLS certificate system. They are expected to be secure, reliable, and independent of the user's PDS.

A backup of the user’s data will be persistently synced to their client as a backup (contingent on the disk space available). Should a PDS disappear without notice, the user should be able to migrate to a new provider by updating their DID Document and uploading the backup.

### Speech, reach, and moderation

Atproto's model is that _speech_ and _reach_ should be two separate layers, built to work with each other. The “speech” layer should remain permissive, distributing authority and designed to ensure everyone has a voice. The “reach” layer lives on top, built for flexibility and designed to scale.

The base layer of atproto (personal data repositories and federated networking) creates a common space for speech where everyone is free to participate, analogous to the Web where anyone can put up a website. The indexing services then enable reach by aggregating content from the network, analogous to a search engine.