---
sidebar_position: 13
---

# PDS Entryway

Bluesky runs many PDSs. Each PDS runs as a completely separate service in the network with it's own identity. They federate with the rest of the network in the exact same manner that a non-Bluesky PDS would. These PDSs have hostnames such as `morel.us-east.host.bsky.network`.

however, the user-facing concept fo Bluesky's "PDS Service" is simply `bsky.social`. This is reflected in the provided subdomain that users on a Bluesky PDS have access to, as well as the hostname that they may provide at login in order to route their login request to the correct service. A user should not be expected to understand or remember the specific host that their account is on

To enable this, we introduced a "PDS Entryway service".  This service is used to orchestrate account managment across Bluesky PDSs and to provide an interface for interacting with `bsky.social` accounts.

### Account Management

When a user creates an account on a Bluesky PDS, the call to `com.atproto.server.createAccount` is sent to the Entryway at `bsky.social`. The newly created account is then sorted on to one of the Bluesky PDSs.

Similarly, session management is handled by the Entryway. However, if a user attempts to refresh/delete their session by sending a request to their PDS host, their PDS will take care of forwarding that request on to the Entryway to provide a seemless experience.

In this sense, the Entryway signs valid access tokens for users of Bluesky PDSs and in this sense it plays a role similar to an OAuth Authorizaiton Server. And, in fact, as we introduce OAuth to atproto, we expect the Entryway to take on that role.

### Virtual PDS

The Entryway also provides an interface to simplify interacting with users on Bluesky PDSs. Most requests that can be sent to a PDS on behalf of a user can also be sent to the Entryway instead. the Entryway will then forward the request to the relevant PDS.

This allows developers to think of users on Bluesky PDSs as being "on `bsky.social`". 

Of course, a developer can always short-circuit this behavior and go directly to a user's PDS.

We recommend this behavior, and to enable it, we return the user's DID document (which contains the user's actual PDS hostname) in all session management routes (including `createAccount`). 

The Typescript API library published by Bluesky takes care of this dynamic routing automatically. Developers may configure it to communciate with `bsky.social`, on session creation, it will reconfigure the agent to send requests to the user's actual PDS.
