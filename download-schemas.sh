#!/bin/bash

# Create directory structure
mkdir -p dev-deployment-qx33gh3495

# Extract all JSON file references from the OpenAPI spec
echo "Extracting JSON schema references..."
grep -Eo '"/dev-deployment-qx33gh3495/[^"]*\.json"' openapi-fixed.json | tr -d '"' | sort -u > schema-files.txt

# Download each schema file
while read -r path; do
    filename=$(basename "$path")
    echo "Downloading $filename..."
    curl -s "http://localhost$path" > "dev-deployment-qx33gh3495/$filename"
    if [ $? -eq 0 ]; then
        echo "✓ Downloaded $filename"
    else
        echo "✗ Failed to download $filename"
    fi
done < schema-files.txt

echo ""
echo "All schema files downloaded. Directory structure:"
ls -la dev-deployment-qx33gh3495/

rm schema-files.txt
