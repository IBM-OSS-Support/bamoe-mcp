#!/bin/bash

echo "🔍 Testing BAMOE Direct Connection"
echo "=================================="
echo ""

# Test 1: High Risk Transaction (Dormant account)
echo "Test 1: High Risk Transaction (Dormant Account)"
echo "-----------------------------------------------"
curl -X POST http://localhost/dev-deployment-qx33gh3495/DMN_85B532DA-3AEF-4716-A502-633D8178F974/dmnresult \
  -H "Content-Type: application/json" \
  -d '{
    "transactionAmount": 120000,
    "isKnownDevice": false,
    "transactionLocation": "New City",
    "accountStatus": "Dormant"
  }' | jq '.dmnContext.fraudRisk'

echo ""
echo ""

# Test 2: Unknown Risk Transaction (Active account, high amount)
echo "Test 2: Unknown Risk Transaction (Active Account)"
echo "-------------------------------------------------"
curl -X POST http://localhost/dev-deployment-qx33gh3495/DMN_85B532DA-3AEF-4716-A502-633D8178F974/dmnresult \
  -H "Content-Type: application/json" \
  -d '{
    "transactionAmount": 85000,
    "isKnownDevice": false,
    "transactionLocation": "Mumbai",
    "accountStatus": "active"
  }' | jq '.dmnContext.fraudRisk'

echo ""
echo ""

# Test 3: Low Risk Transaction (Known device, low amount)
echo "Test 3: Low Risk Transaction (Known Device, Low Amount)"
echo "-------------------------------------------------------"
curl -X POST http://localhost/dev-deployment-qx33gh3495/DMN_85B532DA-3AEF-4716-A502-633D8178F974/dmnresult \
  -H "Content-Type: application/json" \
  -d '{
    "transactionAmount": 5000,
    "isKnownDevice": true,
    "transactionLocation": "Mumbai",
    "accountStatus": "active"
  }' | jq '.dmnContext.fraudRisk'

echo ""
echo ""
echo "✅ Compare these results with what your UI shows!"
