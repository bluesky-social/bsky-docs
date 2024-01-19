#!/bin/bash

TARGET_DIR="./docs/api"

# File to exclude from deletion
EXCLUDE_FILE="_category_.json"

# Loop through each file in the target directory
for file in "$TARGET_DIR"/*; do
    # Extract the filename from the path
    filename=$(basename "$file")
    # Check if the filename is not the excluded file
    if [ "$filename" != "$EXCLUDE_FILE" ]; then
        # Delete the file
        rm "$file"
    fi
done

echo "All generated MDX API files have been deleted."