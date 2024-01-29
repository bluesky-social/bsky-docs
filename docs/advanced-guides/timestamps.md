---
sidebar_position: 6
---

# Timestamps

Bluesky is a distributed network, which means [clocks can skew](https://en.wikipedia.org/wiki/Clock_skew) and [time is relative](https://en.wikipedia.org/wiki/General_relativity). Furthermore, tricksters might lie about timestamps in app clients or at the PDS instance level. To sort all of this out, we have a few simple guidelines for working with timestamps.

First off, any software creating timestamps should ensure they are generating strictly-valid timestamps as per the [atproto specification](https://atproto.com/specs/lexicon#datetime). The reference PDS implementation has been more lenient then the specification in the past, but the intention is to be more strict going forward. In particular, it is required to include a timezone.

The intention of the built-in `datetime` string format is to record timestamps from the contemporary era. There are corner-cases which crop up around very old dates (eg, differing calendar systems, or behaviors around "year zero"), or very far future dates (eg, 5-digit years). We recommend simply rejecting far-past and far-future timestamps to simplify things. Applications which need to represent arbitrary historical or far-future datetimes should pick a different format and store them as regular `string` fields.

Clock skew will be discussed below. When dealing with "future" events, it is good to have a window of fuzziness, such that timestamps just a few seconds in the future are not considered invalid. A reasonable "window" value (`CLOCK_SKEW_WINDOW`) is 2 minutes, though this is not formally part of the specification, and this recommended value may evolve over time.


## `createdAt`, `indexedAt`, and `sortAt`

The most obvious place that datetimes show up in the Bluesky application are post `createdAt` timestamps. These are generally assumed to represent the original time of posting, but clients are allowed insert any value. This flexibility enables things like importing microblogging posts from other platforms, or migrating content between Bluesky servers. But it does open up the possibility of shenanigans. For example, if you chose a far-future timestamp, that record will always sort at the top of chronologically-sorted lists of posts.

Another timestamp generally available to clients is `indexedAt`, which generally represents the time the record was "first seen" by an API server, though might also be updated if the record is edited. Using only this timestamp would mean that bulk-imported records would all get timestamps very close together around the import time, which is correct either.

The simple compromise we recommend is to define a `sortAt` timestamp, defined as the "earlier" of the `createdAt` and `indexedAt` timestamps. In other words, use the `createdAt` timestamp, unless it is in the future (after "now", possibly ignoring a clock skew window), in which case use the `indexedAt` timestamp).

A more sophisticated variant is to have `sortAt` be "nullable", and simply not include "null" `sortAt` posts in chronological lists. And set `sortAt` using the logic:

* if `createdAt` is older than the [UNIX epoch](https://en.wikipedia.org/wiki/Unix_time), set `sortAt` to null (or alternatively, to the UNIX epoch)
* if `createdAt` is between the UNIX epoch and `indexedAt` (or is "future" beyond a skew window), set `sortAt` to `createdAt`
* if `createdAt` is greater than `indexedAt` (or is "future" beyond a skew window), set `sortAt` to `indexedAt`

This is the logic used by the AppView for author feeds, reply threads, and other chronologically-sorted feeds.

Note that this logic does not work in the absence of some `indexedAt` timestamp, for example when working directly with a repository export CAR file, or bootstrapping by re-crawling the network. In that case, you can substitute "now" for `indexedAt`, or consider re-mapping "future" timestamps to a far-past date (like year 1970 or 1900).


## Record Key TIDs

Technically, the [Timestamp Identifiers (TIDs)](https://atproto.com/specs/record-key#record-key-type-tid) in Record Keys map to a timestamp. It might be tempting to parse and use these as a timestamp, but we recommend against this. It is beneficial to use "correct" timestamps for these identifiers, to ensure they increase monotonically over time (which makes the repository tree structure more efficient), but they are not expected to be valid timestamps, can be defined arbitrarily by clients or PDS instances, and are not validated anywhere in the network.


## Repository Commit Revision TIDs

Repository commits contain a "revision" (`rev`) TID identifier.

The semantics of these are a monotonically increasing version number. To prevent repositories from "breaking" themselves by setting a very high revision number (which can no longer be incremented), downstream consumers should ignore commits with `rev` numbers that correspond to a timestamp in the future (while allowing for a clock skew window).

Again, similar to Record Keys, these TID values should not be parsed and expected to represent actual timestamps. It is perfectly valid for a PDS to start `rev` numbers at 1 and increment from there (as long as the repository has no previous history or higher `rev` commits in the network). The "no future value" constraint and "just use current time" recommendation are simply mechanisms to ensure easy comparison of commits and decide which is "most recent".


## Firehose Event Timestamps

We recommend against using or relying on the timestamps included in firehose events, other than for configuring or debugging the firehose itself.
