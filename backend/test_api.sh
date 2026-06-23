#!/bin/bash

# Simple script to test Phase 2 API endpoints

API_URL="http://localhost:5000/api"
echo "=== Starting API Endpoint Verification Tests ==="

# 1. Register User
echo -e "\n1. Registering user 'test_dev'..."
REGISTER_RES=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "test_dev", "email": "test_dev@example.com", "password": "password123"}')

echo "Register Response:"
echo "$REGISTER_RES"

# 2. Login User
echo -e "\n2. Logging in..."
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test_dev@example.com", "password": "password123"}')

echo "Login Response:"
echo "$LOGIN_RES"

# Extract Token
TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
if [ -z "$TOKEN" ]; then
  echo "Failed to extract token. Exiting."
  exit 1
fi
echo "Extracted JWT Token: ${TOKEN:0:15}...[truncated]"

# 3. Get Applications (should be empty for new user)
echo -e "\n3. Fetching applications (expecting count 0)..."
APPS_RES=$(curl -s -X GET "$API_URL/applications" \
  -H "Authorization: Bearer $TOKEN")
echo "$APPS_RES"

# 4. Create an Application (Google - SDE)
echo -e "\n4. Creating a new application (Google, Software Engineer)..."
CREATE_APP_RES=$(curl -s -X POST "$API_URL/applications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Google",
    "jobTitle": "Software Engineer",
    "jobDescription": "Full-stack developer role",
    "jobUrl": "https://google.com/jobs",
    "salary": 140000,
    "location": "New York, NY",
    "workMode": "Hybrid",
    "status": "Applied"
  }')
echo "$CREATE_APP_RES"

# Extract Application ID
APP_ID=$(echo "$CREATE_APP_RES" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
if [ -z "$APP_ID" ]; then
  echo "Failed to extract application ID. Exiting."
  exit 1
fi
echo "Created Application ID: $APP_ID"

# 5. Add an Interview Round to the Application
echo -e "\n5. Adding Online Assessment round to Application $APP_ID..."
CREATE_ROUND_RES=$(curl -s -X POST "$API_URL/applications/$APP_ID/rounds" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roundName": "HackerRank OA",
    "roundType": "OA",
    "status": "Pending",
    "scheduledAt": "2026-07-10T14:00:00.000Z",
    "notes": "Practice arrays and strings."
  }')
echo "$CREATE_ROUND_RES"

# Extract Round ID
ROUND_ID=$(echo "$CREATE_ROUND_RES" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
echo "Created Round ID: $ROUND_ID"

# 6. Fetch Rounds for this Application
echo -e "\n6. Fetching rounds for Application $APP_ID..."
GET_ROUNDS_RES=$(curl -s -X GET "$API_URL/applications/$APP_ID/rounds" \
  -H "Authorization: Bearer $TOKEN")
echo "$GET_ROUNDS_RES"

# 7. Update the Interview Round Status
echo -e "\n7. Updating Round $ROUND_ID to Completed..."
UPDATE_ROUND_RES=$(curl -s -X PUT "$API_URL/rounds/$ROUND_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roundName": "HackerRank OA",
    "roundType": "OA",
    "status": "Completed",
    "notes": "Passed with 100% test cases."
  }')
echo "$UPDATE_ROUND_RES"

# 8. Get Companies list
echo -e "\n8. Fetching registered companies list..."
COMPANIES_RES=$(curl -s -X GET "$API_URL/companies" \
  -H "Authorization: Bearer $TOKEN")
echo "$COMPANIES_RES"

# 9. Clean up (Delete the application)
echo -e "\n9. Cleaning up application $APP_ID..."
DELETE_APP_RES=$(curl -s -X DELETE "$API_URL/applications/$APP_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "$DELETE_APP_RES"

echo -e "\n=== Verification Tests Completed ==="
