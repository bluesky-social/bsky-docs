---
sidebar_position: 6
---

# Posts

This is an in-depth dive into how creating a post works on Bluesky. We'll use Python below, without a SDK, so you can see how it works behind the scenes.

You can skip the tutorial and get the full script of examples [here](https://github.com/bluesky-social/cookbook/tree/main/python-bsky-post).

## Post Record Structure

Here is what a basic post record should look like, as a JSON object:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "Hello World!",
  "createdAt": "2023-08-07T05:31:12.156888Z"
}
```

Bluesky posts are repository records with the [Lexicon type](https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/post.json) `app.bsky.feed.post` — this  defines the schema for what a post looks like.

Each post requires these fields: `text` and `createdAt` (a timestamp).

This script below will create a simple post with just a text field and a timestamp. You'll need the `datetime` package installed.

```python
import json
from datetime import datetime, timezone

# Fetch the current time
# Using a trailing "Z" is preferred over the "+00:00" format
now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

# Required fields that each post must include
post = {
    "$type": "app.bsky.feed.post",
    "text": "Hello World!",
    "createdAt": now,
}

resp = requests.post(
    pds_url + "/xrpc/com.atproto.repo.createRecord",
    headers={"Authorization": "Bearer " + session["accessJwt"]},
    json={
        "repo": session["did"],
        "collection": "app.bsky.feed.post",
        "record": post,
    },
)
print(json.dumps(resp.json(), indent=2))
resp.raise_for_status()
```

The full repository path (including the auto-generated `rkey`) will be returned as a response to the `createRecord` request. It looks like:

```json
{
  "uri": "at://did:plc:u5cwb2mwiv2bfq53cjufe6yn/app.bsky.feed.post/3k4duaz5vfs2b",
  "cid": "bafyreibjifzpqj6o6wcq3hejh7y4z4z2vmiklkvykc57tw3pcbx3kxifpm"
}
```

## Setting the language

Setting the post's language helps custom feeds or other services filter and parse posts.

This snippet sets the `text` and `langs` value of a post to be Thai and English.
```python
# an example with Thai and English (US) languages
post["text"] = "สวัสดีชาวโลก!\nHello World!"
post["langs"] = ["th", "en-US"]
```

The resulting post record object looks like:
```json
{
  "$type": "app.bsky.feed.post",
  "text": "\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e35\u0e0a\u0e32\u0e27\u0e42\u0e25\u0e01!\\nHello World!",
  "createdAt": "2023-08-07T05:44:04.395087Z",
  "langs": [ "th", "en-US" ]
}
```

You can include multiple values in the array if there are multiple languages present in the post. The Bluesky Social client auto-detects the languages in each post and sets them as the default `langs` value, but a user can override the configuration on a per-post basis.

## Mentions and links

Mentions and links are annotations that point into the text of a post. They are actually part of a broader system for [rich-text facets](/docs/advanced-guides/post-richtext). Facets only support links and mentions for now, but can be extended to support features like bold and italics in the future.

Suppose we have a post:

```
✨ example mentioning @atproto.com to share the URL 👨‍❤️‍👨 https://en.wikipedia.org/wiki/CBOR.
```

Our goal is to turn the handle (`@atproto.com`) into a mention and the URL (`https://en.wikipedia.org/wiki/CBOR`) into a link. To do that, we grab the starting and ending locations of each "facet".

```
✨ example mentioning @atproto.com to share the URL 👨‍❤️‍👨 https://en.wikipedia.org/wiki/CBOR.
             start=23^     end=35^            start=74^                          end=108^
```

We then identify them in the facets array, using the _mention_ and _link_ feature types. (You can view the schema of a facet object [here](https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/richtext/facet.json).) The post record will then look like this:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "\u2728 example mentioning @atproto.com to share the URL \ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68 https://en.wikipedia.org/wiki/CBOR.",
  "createdAt": "2023-08-08T01:03:41.157302Z",
  "facets": [
    {
      "index": {
        "byteStart": 23,
        "byteEnd": 35
      },
      "features": [
        {
          "$type": "app.bsky.richtext.facet#mention",
          "did": "did:plc:ewvi7nxzyoun6zhxrhs64oiz"
        }
      ]
    },
    {
      "index": {
        "byteStart": 74,
        "byteEnd": 108
      },
      "features": [
        {
          "$type": "app.bsky.richtext.facet#link",
          "uri": "https://en.wikipedia.org/wiki/CBOR"
        }
      ]
    }
  ]
}
```

You can programmatically set the `start` and `end` points of a facet with regexes. Here's a script that parses mentions and links:
```python
import re
from typing import List, Dict

def parse_mentions(text: str) -> List[Dict]:
    spans = []
    # regex based on: https://atproto.com/specs/handle#handle-identifier-syntax
    mention_regex = rb"[$|\W](@([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)"
    text_bytes = text.encode("UTF-8")
    for m in re.finditer(mention_regex, text_bytes):
        spans.append({
            "start": m.start(1),
            "end": m.end(1),
            "handle": m.group(1)[1:].decode("UTF-8")
        })
    return spans

def parse_urls(text: str) -> List[Dict]:
    spans = []
    # partial/naive URL regex based on: https://stackoverflow.com/a/3809435
    # tweaked to disallow some training punctuation
    url_regex = rb"[$|\W](https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*[-a-zA-Z0-9@%_\+~#//=])?)"
    text_bytes = text.encode("UTF-8")
    for m in re.finditer(url_regex, text_bytes):
        spans.append({
            "start": m.start(1),
            "end": m.end(1),
            "url": m.group(1).decode("UTF-8"),
        })
    return spans
```

Once the facet segments have been parsed out, we can then turn them into `app.bsky.richtext.facet` objects.

```python
# Parse facets from text and resolve the handles to DIDs
def parse_facets(text: str) -> List[Dict]:
    facets = []
    for m in parse_mentions(text):
        resp = requests.get(
            pds_url + "/xrpc/com.atproto.identity.resolveHandle",
            params={"handle": m["handle"]},
        )
        # If the handle can't be resolved, just skip it!
        # It will be rendered as text in the post instead of a link
        if resp.status_code == 400:
            continue
        did = resp.json()["did"]
        facets.append({
            "index": {
                "byteStart": m["start"],
                "byteEnd": m["end"],
            },
            "features": [{"$type": "app.bsky.richtext.facet#mention", "did": did}],
        })
    for u in parse_urls(text):
        facets.append({
            "index": {
                "byteStart": u["start"],
                "byteEnd": u["end"],
            },
            "features": [
                {
                    "$type": "app.bsky.richtext.facet#link",
                    # NOTE: URI ("I") not URL ("L")
                    "uri": u["url"],
                }
            ],
        })
    return facets
```

The list of facets gets attached to the `facets` field of the post record:

```python
post["text"] = "✨ example mentioning @atproto.com to share the URL 👨‍❤️‍👨 https://en.wikipedia.org/wiki/CBOR."
post["facets"] = parse_facets(post["text"])
```

## Replies, quote posts, and embeds

Replies and quote posts contain **strong references** to other records. A strong reference is a combination of:
- **AT URI:** indicates the repository DID, collection, and record key
- **CID:** the hash of the record itself

Posts can have several types of embeds: record embeds, images and exernal embeds (like link/webpage cards, which is the preview that shows up when you post a URL).

### Replies

A complete reply post record looks like:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "example of a reply",
  "createdAt": "2023-08-07T05:49:40.501974Z",
  "reply": {
    "root": {
      "uri": "at://did:plc:u5cwb2mwiv2bfq53cjufe6yn/app.bsky.feed.post/3k43tv4rft22g",
      "cid": "bafyreig2fjxi3rptqdgylg7e5hmjl6mcke7rn2b6cugzlqq3i4zu6rq52q"
    },
    "parent": {
      "uri": "at://did:plc:u5cwb2mwiv2bfq53cjufe6yn/app.bsky.feed.post/3k43tv4rft22g",
      "cid": "bafyreig2fjxi3rptqdgylg7e5hmjl6mcke7rn2b6cugzlqq3i4zu6rq52q"
    }
  }
}
```
Since threads of replies can get pretty long, reply posts need to reference both the immediate parent post and the original root post of the thread.

Here's a Python script to find the parent and root values:
```python
# Resolve the parent record and copy whatever the root reply reference there is
# If none exists, then the parent record was a top-level post, so that parent reference can be reused as the root value
def get_reply_refs(parent_uri: str) -> Dict:
    uri_parts = parse_uri(parent_uri)

    resp = requests.get(
        pds_url + "/xrpc/com.atproto.repo.getRecord",
        params=uri_parts,
    )
    resp.raise_for_status()
    parent = resp.json()

    parent_reply = parent["value"].get("reply")
    if parent_reply is not None:
        root_uri = parent_reply["root"]["uri"]
        root_repo, root_collection, root_rkey = root_uri.split("/")[2:5]
        resp = requests.get(
            pds_url + "/xrpc/com.atproto.repo.getRecord",
            params={
                "repo": root_repo,
                "collection": root_collection,
                "rkey": root_rkey,
            },
        )
        resp.raise_for_status()
        root = resp.json()
    else:
        # The parent record is a top-level post, so it is also the root
        root = parent

    return {
        "root": {
            "uri": root["uri"],
            "cid": root["cid"],
        },
        "parent": {
            "uri": parent["uri"],
            "cid": parent["cid"],
        },
    }
```

The root and parent refs are stored in the `reply` field of posts:

```python
post["reply"] = get_reply_refs("at://atproto.com/app.bsky.feed.post/3k43tv4rft22g")
```

### Quote posts

A quote post embeds a reference to another post record. A complete quote post record would look like:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "example of a quote-post",
  "createdAt": "2023-08-07T05:49:39.417839Z",
  "embed": {
    "$type": "app.bsky.embed.record",
    "record": {
      "uri": "at://did:plc:u5cwb2mwiv2bfq53cjufe6yn/app.bsky.feed.post/3k44deefqdk2g",
      "cid": "bafyreiecx6dujwoeqpdzl27w67z4h46hyklk3an4i4cvvmioaqb2qbyo5u"
    }
  }
}
```
The record embedded here is the post that's getting quoted. The post record type is `app.bsky.feed.post`, but you can also embed other record types in a post, like lists (`app.bsky.graph.list`) and feed generators (`app.bsky.feed.generator`).

### Images embeds

Images are also embedded objects in a post. This example code demonstrates reading an image file from disk and uploading it, capturing a `blob` in the response:
```python
IMAGE_PATH = "./example.png"
IMAGE_MIMETYPE = "image/png"
IMAGE_ALT_TEXT = "brief alt text description of the image"

with open(IMAGE_PATH, "rb") as f:
    img_bytes = f.read()

# this size limit is specified in the app.bsky.embed.images lexicon
if len(img_bytes) > 1000000:
    raise Exception(
        f"image file size too large. 1000000 bytes maximum, got: {len(img_bytes)}"
    )

# TODO: strip EXIF metadata here, if needed

resp = requests.post(
    pds_url + "/xrpc/com.atproto.repo.uploadBlob",
    headers={
        "Content-Type": IMAGE_MIMETYPE,
        "Authorization": "Bearer " + session["accessJwt"],
    },
    data=img_bytes,
)
resp.raise_for_status()
blob = resp.json()["blob"]
```

The blob object, as JSON, would look something like:

```json
{
    "$type": "blob",
    "ref": {
        "$link": "bafkreibabalobzn6cd366ukcsjycp4yymjymgfxcv6xczmlgpemzkz3cfa"
    },
    "mimeType": "image/png",
    "size": 760898
}
```

The blob is then included in a `app.bsky.embed.images` array, along with an alt-text string and an aspect ratio.

To get the aspect ratio, you'll need a library like [Pillow](https://pillow.readthedocs.io/). Specifying the correct aspect ratio will help client apps display the images without performance or visual issues. The exact specific dimensions don't need to be known, only the ratio between the `width` and the `height` is important. If you don't know the image aspect ratio and don't parse the image to detect the dimensions, it is best to leave the `aspectRatio` field undefined instead of guessing.

```python
from PIL import Image

# ...

with Image.open(IMAGE_PATH) as im:
    width, height = im.size

post["embed"] = {
    "$type": "app.bsky.embed.images",
    "images": [{
        "alt": IMAGE_ALT_TEXT,
        "image": blob,
        "aspectRatio": {
            "width": width,
            "height": height
        }
    }],
}
```

A complete post record, containing two images, would look something like:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "example post with multiple images attached",
  "createdAt": "2023-08-07T05:49:35.422015Z",
  "embed": {
    "$type": "app.bsky.embed.images",
    "images": [
      {
        "alt": "brief alt text description of the first image",
        "image": {
          "$type": "blob",
          "ref": {
            "$link": "bafkreibabalobzn6cd366ukcsjycp4yymjymgfxcv6xczmlgpemzkz3cfa"
          },
          "mimeType": "image/webp",
          "size": 760898
        },
        "aspectRatio": {
          "width": 1280,
          "height": 760
        }
      },
      {
        "alt": "brief alt text description of the second image",
        "image": {
          "$type": "blob",
          "ref": {
            "$link": "bafkreif3fouono2i3fmm5moqypwskh3yjtp7snd5hfq5pr453oggygyrte"
          },
          "mimeType": "image/png",
          "size": 13208
        },
        "aspectRatio": {
          "width": 500,
          "height": 300
        }
      }
    ]
  }
}
```

Each post contains up to four images, and each image can have its own alt text and aspect ratio. Individual images are limited to 1,000,000 bytes in size. Image files are *referenced* by posts, but are not actually *included* in the post (eg, using `bytes` with base64 encoding). The image files are first uploaded as "blobs" using `com.atproto.repo.uploadBlob`, which returns a `blob` metadata object, which is then embedded in the post record itself.

It's strongly recommended best practice to strip image metadata before uploading. The server (PDS) may be more strict about blocking upload of such metadata by default in the future, but it is currently the responsibility of clients (and apps) to sanitize files before upload today.

### Website card embeds

A website card embed, often called a "social card," is the rendered preview of a website link. A complete post record with an external embed, including image thumbnail blob, looks like:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "post which embeds an external URL as a card",
  "createdAt": "2023-08-07T05:46:14.423045Z",
  "embed": {
    "$type": "app.bsky.embed.external",
    "external": {
      "uri": "https://bsky.app",
      "title": "Bluesky Social",
      "description": "See what's next.",
      "thumb": {
        "$type": "blob",
        "ref": {
          "$link": "bafkreiash5eihfku2jg4skhyh5kes7j5d5fd6xxloaytdywcvb3r3zrzhu"
        },
        "mimeType": "image/png",
        "size": 23527
      }
    }
  }
}
```

Here's an example of embedding a website card:
```python
from bs4 import BeautifulSoup

def fetch_embed_url_card(access_token: str, url: str) -> Dict:

    # the required fields for every embed card
    card = {
        "uri": url,
        "title": "",
        "description": "",
    }

    # fetch the HTML
    resp = requests.get(url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    # parse out the "og:title" and "og:description" HTML meta tags
    title_tag = soup.find("meta", property="og:title")
    if title_tag:
        card["title"] = title_tag["content"]
    description_tag = soup.find("meta", property="og:description")
    if description_tag:
        card["description"] = description_tag["content"]

    # if there is an "og:image" HTML meta tag, fetch and upload that image
    image_tag = soup.find("meta", property="og:image")
    if image_tag:
        img_url = image_tag["content"]
        # naively turn a "relative" URL (just a path) into a full URL, if needed
        if "://" not in img_url:
            img_url = url + img_url
        resp = requests.get(img_url)
        resp.raise_for_status()

        blob_resp = requests.post(
            pds_url + "/xrpc/com.atproto.repo.uploadBlob",
            headers={
                "Content-Type": IMAGE_MIMETYPE,
                "Authorization": "Bearer " + access_token,
            },
            data=resp.content,
        )
        blob_resp.raise_for_status()
        card["thumb"] = blob_resp.json()["blob"]

    return {
        "$type": "app.bsky.embed.external",
        "external": card,
    }
```

An external embed is stored under `embed` like all the others:

```python
post["embed"] = fetch_embed_url_card(session["accessJwt"], "https://bsky.app")
```

On Bluesky, each client fetches and embeds this card metadata, including blob upload if needed. Embedding the card content in the record ensures that it appears consistently to everyone and reduces waves of automated traffic being sent to the referenced website, but it does require some extra work by the client. 

## Putting it all together

A complete script, with command-line argument parsing, is available [here](https://github.com/bluesky-social/cookbook/tree/main/python-bsky-post).

We expect most folks will use SDKs or libraries for their programming language of choice to help with most of the details described here. But sometimes it is helpful to see what is actually going on behind the abstractions.
