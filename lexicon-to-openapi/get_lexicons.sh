#!/bin/bash

URL="https://codeload.github.com/bluesky-social/atproto/tar.gz/main"

DEST_PATH="lexicon-to-openapi/lexicons"
TAR_PATH="atproto-main/lexicons"

# Download and extract the specified path
curl $URL | tar -xz --strip=2 --directory $DEST_PATH $TAR_PATH

echo "Copied lexicons to $DEST_PATH."
