#!/usr/bin/env python3
import json

# Read the original spec
with open('openapi.json', 'r') as f:
    spec = json.load(f)

# Add servers section pointing to actual BAMOE service on port 80
spec['servers'] = [
    {
        'url': 'http://host.docker.internal:80/dev-deployment-qx33gh3495',
        'description': 'BAMOE Canvas Server'
    }
]

# Write the modified spec
with open('openapi-fixed.json', 'w') as f:
    json.dump(spec, f, indent=2)

print("✅ Fixed OpenAPI spec saved to openapi-fixed.json")
print("   Added server URL: http://host.docker.internal:80/dev-deployment-qx33gh3495")
