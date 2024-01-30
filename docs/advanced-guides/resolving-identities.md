---
sidebar_position: 16
---

# Resolving Identities

Identities in the Bluesky network are made up of a couple core components:

- DIDs: persistent, long-term identifiers for every account. Usually look like `did:plc:ewvi7nxzyoun6zhxrhs64oiz`. Details are in the [atproto specs](https://atproto.com/specs/did)
- Handles: updatable, human-readable usernames for accounts. Look like `atproto.bsky.social` or `atproto.com`. Details are in the [atproto specs](https://atproto.com/specs/handle)
- Profile records: updatable metadata including a display name, avatar picture, and description. Lexicon is `app.bsky.actor.profile`


## For Clients

Bluesky client apps don't need to do identity resolution very often, because Bluesky API responses often hydrate in identity and profile metadata when needed.

When they do need to resolve identities, they may be able to get by with the PDS-provided `com.atproto.identity.resolveHandle`, or future endpoints to facilitate identity resolution server-side (possibly with caching).

Otherwise, they will need to do direct resolution. Browser-based clients can not generally make arbitrary DNS queries, so the `com.atproto.identity.resolveHandle` is used for that type of handle resolution.


## For Backend Services

While it is possible in some cases to simply trust infrastructure like the Relay to pass through identity metadata over the firehose, more independent service providers are likely to resolve identities (handles and DIDs) on their own. This ensures handle/DID mappings are valid, and provides direct access to cryptographic keys for validating signatures.

The process of resolving identities usually involves a handful of DNS and HTTPS network requests, and in the common case should succeed within a couple hundred milliseconds. The atproto specifications include details on resolving `did:web` and `did:plc` identifiers, and resolving handles using both the DNS TXT and HTTPS `/.well-known/` mechanism. Services should support all of these methods.

For `did:plc` specifically, implementations should decide whether to trust the PLC directory to return accurate DID documents, or to fetch the operation log (or even audit log) and fully re-validate the operations.

It is strongly recommended to use identity caches for large backend services. Cached information needs to be re-validated periodically; we recommend a maximum TTL of 24 hours for core identity metadata. It is often helpful to cache failures as well as successful lookups, but shorter TTLs (on the order of 5 minutes) are better in this case. For example, if a handle is found to be invalid, don't continuously retry several times a second, but don't wait a full 24 hours before retrying either. A few more tips on identity caching at scale:

- it may be appropriate to retry identity resolution when account data validation fails in certain ways. For example, if a commit signatures fails to validate, it might be worth purging any identity cache and directly re-resolving the DID to see if the signing keys were updated. If feed generator API requests fail, an intermediate service might want to re-resolve the service DID document to see if the service endpoint moved.
- the DID PLC registry has a global operation log API endpoint, which can be used to poll for identity updates. The Relay firehose also includes identity update events. Both of these feeds can be used to proactively update identity caches while making fewer network calls
- remember that the global DNS system has it's own caching and TTL behaviors. In some cases it may be beneficial to retry handle resolutions "harder", for example using some degree of recursive resolution, or an alternative DNS server
- depending on the use-case, services might want to proactively re-validate identities when they expire, or they might wait to "read-through" the cache
- use best-practices for HTTP requests: reasonable timeouts and retries, exponential backoff, handling HTTP status codes correctly (including 429 "Rate-Limit Exceeded" and 404 "Not Found")

Backend services generally don't always need access to Bluesky profile records. One case where they may this data is if they are providing public web access to user data, and want to respect the public web opt-out (`!no-unauthenticated` self-label on the profile record).
