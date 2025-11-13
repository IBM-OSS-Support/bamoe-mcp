#!/bin/bash

# Build and Push Script for BAMOE MCP Web App
# This script builds the Docker image and pushes it to quay.io

set -e  # Exit on error

# Configuration
REGISTRY="quay.io"
NAMESPACE="pamoe"
IMAGE_NAME="bamoe-mcp-web-app"
TAG="latest"
FULL_IMAGE_NAME="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${TAG}"

echo "======================================"
echo "BAMOE MCP Web App - Build & Push"
echo "======================================"
echo ""

# Step 1: Login to quay.io (if not already logged in)
echo "Step 1: Logging in to ${REGISTRY}..."
echo "Please enter your credentials:"
docker login ${REGISTRY}

if [ $? -eq 0 ]; then
    echo "✓ Login successful"
else
    echo "✗ Login failed"
    exit 1
fi

echo ""

# Step 2: Build multi-platform image and push directly
echo "Step 2: Building multi-platform image (linux/amd64, linux/arm64) and pushing..."
echo "This will work on AMD64 (Intel/AMD), ARM64 (Mac M1/M2/M3), and other architectures"
docker buildx build --platform linux/amd64,linux/arm64 -t ${FULL_IMAGE_NAME} --push .

if [ $? -eq 0 ]; then
    echo "✓ Build and push successful"
else
    echo "✗ Build and push failed"
    exit 1
fi

echo ""
echo "======================================"
echo "✓ All steps completed successfully!"
echo "======================================"
echo ""
echo "Multi-platform image available at: ${FULL_IMAGE_NAME}"
echo "Supports: linux/amd64, linux/arm64"
echo ""
