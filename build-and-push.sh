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

# Step 1: Build the Docker image
echo "Step 1: Building Docker image..."
docker build -t ${IMAGE_NAME} .

if [ $? -eq 0 ]; then
    echo "✓ Build successful"
else
    echo "✗ Build failed"
    exit 1
fi

echo ""

# Step 2: Tag the image
echo "Step 2: Tagging image as ${FULL_IMAGE_NAME}..."
docker tag ${IMAGE_NAME} ${FULL_IMAGE_NAME}

if [ $? -eq 0 ]; then
    echo "✓ Tagged successfully"
else
    echo "✗ Tagging failed"
    exit 1
fi

echo ""

# Step 3: Login to quay.io (if not already logged in)
echo "Step 3: Logging in to ${REGISTRY}..."
echo "Please enter your credentials:"
docker login ${REGISTRY}

if [ $? -eq 0 ]; then
    echo "✓ Login successful"
else
    echo "✗ Login failed"
    exit 1
fi

echo ""

# Step 4: Push the image
echo "Step 4: Pushing image to ${REGISTRY}..."
docker push ${FULL_IMAGE_NAME}

if [ $? -eq 0 ]; then
    echo "✓ Push successful"
else
    echo "✗ Push failed"
    exit 1
fi

echo ""
echo "======================================"
echo "✓ All steps completed successfully!"
echo "======================================"
echo ""
echo "Image available at: ${FULL_IMAGE_NAME}"
echo ""
