---
sidebar_position: 8
---

# Rate Limits

Rate limits help us keep the network secure — for example, by limiting the number of requests a user or bot can make in a given time period, it prevents bad actors from brute-forcing certain requests and helps us limit spammy behavior.

## Created Actions per DID

Bluesky rate limits by the number of created actions per DID. **These numbers shouldn’t affect typical Bluesky users**, and won’t affect the majority of developers either, but it will affect prolific bots, such as the ones that follow every user or like every post on the network. The limit is 5,000 points per hour and 35,000 points per day, where:

| Action Type | Value    |
| ----------- | -------- |
| CREATE      | 3 points |
| UPDATE      | 2 points |
| DELETE      | 1 point  |

Per this system, an account may create at most 1,666 records per hour and 11,666 records per day. That means an account can like up to 1,666 records in one hour with no problem. We took the most active human users on the network into account when we set this threshold (you surpassed our expectations!).

## Other Rate Limits

- Global limit (aggregated across all routes)
  - Rate limited by IP
  - 3000/5 min
- updateHandle
  - Rate limited by DID
  - 10/5 min
  - 50/day
- createAccount
  - Rate limited by IP
  - 100/5 min
- createSession
  - Rate limited by handle
  - 30/5 min
  - 300/day
- deleteAccount
  - Rate limited by IP
  - 50/5 min
- resetPassword
  - Rate limited by IP
  - 50/5 min

We also return [rate limit headers](https://www.ietf.org/archive/id/draft-polli-ratelimit-headers-02.html) on each response so developers can dynamically adapt to these standards.