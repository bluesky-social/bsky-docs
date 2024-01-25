---
sidebar_position: 11
---

# Backfilling the Network

The process of backfilling is how you sync all the data in the network from
scratch. The task of backfilling the entire network can be broken down into
handling one repo at a time, since even in the case of interactions, each users
data is entirely independent from each other users data.
Additionally, when talking about backfilling you generally want to maintain an
'up to date' replica of the data, Doing this requires consuming events live off
of the firehose.

The general process:

Given a DID, check your current 'revision' for that DID (Each change to a repo
is tagged with a 'revision' or 'rev' string that is a lexicographically
sortable timestamp). If you do not have a rev for that repo, download and
process the users repo checkpoint from the `com.atproto.sync.getRepo` endpoint.
While you are doing that, buffer any events for the repo to go through after
the checkpoint has been processed. The checkpoint will contain a rev value that
you can use to skip any buffered events that have already been included in said
checkpoint. For each buffered event, if the rev is less than the current rev
you have, you can safely skip it.

Do the above process for each repo and you will end up with a complete replica
of the network. To get a list of all the repos, you can use the
`com.atproto.sync.listRepos` endpoint on the relay, or on each PDS.

Some things to keep in mind:
- This is a fairly large amount of data (hundreds of GBs at the time of
  writing), and will be somewhat demanding in terms of resources. 
- Be careful not to get rate limited, you will be making one call to `getRepo`
  per user. It is recommended to implement client side rate limiting to prevent
  your requests from getting blocked by firewalls on the PDS or relay you are
  requesting data from.
- The firehose event buffering is important to ensure you don't miss any data
  between you fetching the repo and getting back to processing the event
  stream.
