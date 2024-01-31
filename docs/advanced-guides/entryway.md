---
sidebar_position: 14
---

# PDS Entryway

Bluesky runs many PDSs. Each PDS runs as a completely separate service in the network with its own identity. They federate with the rest of the network in the exact same manner that a non-Bluesky PDS would. These PDSs have hostnames such as `morel.us-east.host.bsky.network`.

However, the user-facing concept for Bluesky's "PDS Service" is simply `bsky.social`. This is reflected in the provided subdomain that users on a Bluesky PDS have access to (i.e. their default handle suffix), as well as the hostname that they may provide at login in order to route their login request to the correct service. A user should not be expected to understand or remember the specific host that their account is on.

To enable this, we introduced a PDS Entryway service.  This service is used to orchestrate account management across Bluesky PDSs and to provide an interface for interacting with `bsky.social` accounts.

### Account Management

When a user creates an account on a Bluesky PDS, the call to `com.atproto.server.createAccount` is sent to the Entryway at `bsky.social`. The newly created account is then sorted on to one of the Bluesky PDSs. The end user does not have to be aware of this process at all.

Similarly, session management is handled by the Entryway. However, if a user attempts to refresh/delete their session by sending a request to their PDS host, their PDS will take care of forwarding that request on to the Entryway to provide a seamless experience.

The Entryway signs valid access tokens for users of Bluesky PDSs, and in this sense, it plays a role similar to an OAuth Authorization Server. And, in fact, as we introduce OAuth to atproto, we expect the Entryway to take on that role.

### Virtual PDS

The Entryway also provides an interface to simplify interacting with users on Bluesky PDSs. Most requests that can be sent to a PDS on behalf of a user can also be sent to the Entryway instead. The Entryway will then forward the request to the relevant PDS.

This allows developers to think of users on Bluesky PDSs as being "on `bsky.social`". 

Of course, a developer can always short-circuit this behavior and go directly to a user's PDS.

We recommend this behavior, and to enable it, we return the user's DID document (which contains the user's actual PDS hostname) in all session management routes (including `createAccount`). 

The [Typescript API library](https://www.npmjs.com/package/@atproto/api) published by Bluesky takes care of this dynamic routing automatically. Developers may configure it to communicate with `bsky.social`. On session creation, it will reconfigure the agent to send requests to the user's actual PDS.

### Engaging with Entryway as a developer

Ideally, developers should not have to engage much with the concepts surrounding the Entryway. The important things to note are:

- the user's PDS is the hostname listed in the DID doc
- when offering signup/login to a user, Bluesky PDSs should be communicated as `bsky.social`
- most application requests can be sent to _either_ the Entryway _or_ the PDS
- for non-session related routes, we encourage going directly to the PDS in order to avoid the extra hop
- if using the Bluesky Typescript SDK, you may configure it with `bsky.social` and the library will handle the dynamic routing for you
