#!/bin/bash

URL="https://codeload.github.com/bluesky-social/atproto/tar.gz/main"

DEST_PATH="atproto-openapi-types/lexicons"
TAR_PATH="atproto-main/lexicons"

# Delete existing files in the destination folder to remove out-of-date lexicons
rm -rf $DEST_PATH/*
mkdir $DEST_PATH

# Download and extract the specified path
curl $URL | tar -xz --strip=2 --directory $DEST_PATH $TAR_PATH

echo "Copied lexicons to $DEST_PATH."