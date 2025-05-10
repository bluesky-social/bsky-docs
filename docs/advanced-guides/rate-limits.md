---
sidebar_position: 4
---

# Rate Limits

Rate limits help service providers keep the network secure. For example, by limiting the number of requests a user or bot can make in a given time period, it prevents bad actors from brute-forcing certain requests and helps us limit spammy behavior.

Different services operated by Bluesky provide distinct services and have different limits. See [API Hosts and Auth](/docs/advanced-guides/api-directory) for an overview of services and roles. Also remember that Bluesky is built on top of an open network (atproto), and other providers in the network are likely to have different rate-limits.

Many HTTP API services return [rate limit headers](https://www.ietf.org/archive/id/draft-polli-ratelimit-headers-02.html) on responses. Developers can use those to debug and understand the current limits, or even automate request throughput and backoff. Requests that cross a limit usually receive an HTTP 429 ("Too Many Requests") response status code.

All of the limits described here are likely to evolve over time. Hopefully upwards!


## Content Write Operations (per account)

The Bluesky PDS instances rate limit the number of repository record operations an individual account (DID) can make. These limits are on top of any related HTTP API requests. For example, `com.atproto.repo.applyWrites` can write to many records in a single API call; these limits sum up all of those individual record writes.

**These limits shouldn’t affect typical Bluesky users!** They won’t affect the majority of developers either. But they will affect prolific bots, such as the ones that follow every other account or like every post on the network.

The limit is 5,000 points per hour and 35,000 points per day. Points are counted as:

| Action Type | Value    |
| ----------- | -------- |
| CREATE      | 3 points |
| UPDATE      | 2 points |
| DELETE      | 1 point  |

Under this system, an account may create at most 1,666 records per hour and 11,666 records per day. That means an account can like up to 1,666 records in one hour with no problem. We took the most active human users on the network into account when we set this threshold (you surpassed our expectations!).

Note that moderation systems and other application-specific limits may apply, or that services may degrade in some situations. For example, following other users and "liking" content both count as interactions in the in the Bluesky app, and bulk or spammy interactions are against the Community Guidelines.


## Hosted Account (PDS) Limits

Most authenticated API requests in go through the account's PDS host, which apply API request rate limits. Some account-level requests may go to a central "entryway" (eg, `https://bsky.social`), which applies similar limits.

- Overall API Requests (all endpoints)
  - Rate limited by IP
  - 3000 per 5 minutes
- `com.atproto.identity.updateHandle`
  - Measured per account
  - 10 per 5 minutes
  - 50 per day
- `com.atproto.server.createAccount`
  - Measured per IP
  - 100 per 5 minutes
- `com.atproto.server.createSession`
  - Measured per account
  - 30 per 5 minutes
  - 300 per day
- `com.atproto.server.deleteAccount`
  - Measured per IP
  - 50 per 5 minutes
- `com.atproto.server.resetPassword`
  - Measured per IP
  - 50 per 5 minutes

The PDS also applies a maximum size limit on individual blob uploads (separate from any application-specific blob size limit). The current limit is 52,428,800 bytes (50 MByte).


## Bluesky AppView Limits

Sometimes clients connect directly to the Bluesky AppView, at `https://api.bsky.app` or `https://public.api.bsky.app`. These direct endpoints do not support authentication. The `public.api.bsky.app` endpoint is cached, and we request developers use that for "public web" use cases.

These API services have generous rate-limits. Please contact us if you encounter rate-limiting.


## Relay Limits

The Bluesky-operated Relay (`https://bsky.network`) applies the following limits to new PDS instances:

- PDS Repository Stream Events (all types)
  - 50 per second
  - 1500 per hour
  - 10,000 per day
- New Account Creation
  - 5 per second

These limits are intended to limit abuse while still allowing open federation. If the default limits cause problems for growing PDS instances, please reach out and they can be raised.

