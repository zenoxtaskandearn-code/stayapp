#!/bin/bash

# ==========================================
# API Test Script for StayApp
# ==========================================
# Usage: ./api-test.sh [BASE_URL]
# Default: http://localhost:5001
# Production: https://theblueground-rental-property.ref37108542.online/api
# ==========================================

if [ -z "$1" ]; then
  BASE_URL="http://localhost:5001/api"
else
  BASE_URL="$1"
fi

# Remove trailing slash if present
BASE_URL="${BASE_URL%/}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

PASS=0
FAIL=0
TOTAL=0

# Helper: Run a test
run_test() {
  local METHOD=$1
  local ENDPOINT=$2
  local BODY=$3
  local AUTH=$4
  local DESCRIPTION=$5

  TOTAL=$((TOTAL + 1))

  echo -e "\n${BLUE}──────────────────────────────────────────────${NC}"
  echo -e "${BOLD}[${TOTAL}] ${DESCRIPTION}${NC}"
  echo -e "  ${METHOD} ${ENDPOINT}"

  # Build curl command
  local CMD="curl -s -w '\n%{http_code}' -X ${METHOD} \"${BASE_URL}${ENDPOINT}\""
  
  if [ -n "$BODY" ]; then
    CMD="${CMD} -H 'Content-Type: application/json' -d '${BODY}'"
  fi

  if [ "$AUTH" = "USER" ] && [ -n "$USER_TOKEN" ]; then
    CMD="${CMD} -H 'Authorization: Bearer ${USER_TOKEN}'"
  elif [ "$AUTH" = "ADMIN" ] && [ -n "$ADMIN_TOKEN" ]; then
    CMD="${CMD} -H 'Authorization: Bearer ${ADMIN_TOKEN}'"
  fi

  # Execute
  local RESPONSE
  RESPONSE=$(eval "$CMD")

  local HTTP_CODE
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  local BODY_RESPONSE
  BODY_RESPONSE=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "  ${GREEN}✓ PASS (HTTP ${HTTP_CODE})${NC}"
    echo -e "  ${GREEN}${BODY_RESPONSE}${NC}" | head -c 500
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗ FAIL (HTTP ${HTTP_CODE})${NC}"
    echo -e "  ${RED}${BODY_RESPONSE}${NC}" | head -c 500
    FAIL=$((FAIL + 1))
  fi
}

# Helper: Extract token from response
extract_token() {
  echo "$1" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
}

echo -e "${BOLD}${BLUE}"
echo -e "=============================================="
echo -e "  StayApp API Test Suite"
echo -e "  Base URL: ${BASE_URL}"
echo -e "=============================================="
echo -e "${NC}"

# ==========================================
# PHASE 1: Public/Health Endpoints
# ==========================================
echo -e "\n${YELLOW}══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}${BOLD}PHASE 1: Health & Public Endpoints${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"

run_test "GET" "/health" "" "" "Health Check"
run_test "GET" "/properties" "" "" "List All Properties"
run_test "GET" "/properties?location=USA&status=available" "" "" "Filter Properties by Location"
run_test "GET" "/properties/featured" "" "" "Get Featured Properties"
run_test "GET" "/properties/types" "" "" "Get Property Types"
run_test "GET" "/properties/locations" "" "" "Get Property Locations"
run_test "GET" "/categories" "" "" "List Categories"
run_test "GET" "/payment-methods" "" "" "List Payment Methods"
run_test "GET" "/payment-methods/property/1" "" "" "Get Payment Methods for Property"

# ==========================================
# PHASE 2: Authentication
# ==========================================
echo -e "\n${YELLOW}══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}${BOLD}PHASE 2: Authentication${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"

# Register a new test user
REGISTER_RESPONSE=$(run_test "POST" "/auth/register" '{"name":"Test User","email":"testuser@example.com","password":"testpass123","phone":"1234567890"}' "" "Register New User" 2>&1)

# Try login (might need verification first)
run_test "POST" "/auth/login" '{"email":"testuser@example.com","password":"testpass123"}' "" "Login (may need verification)"

# Resend OTP
run_test "POST" "/auth/resend-otp" '{"email":"testuser@example.com"}' "" "Resend OTP"

# Verify email (use a known OTP or expect failure)
run_test "POST" "/auth/verify-email" '{"email":"testuser@example.com","otp":"123456"}' "" "Verify Email (may fail with dummy OTP)"

# Test admin login (credentials from seed)
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@stayapp.com","password":"admin123"}')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
  echo -e "\n  ${GREEN}✓ Admin login successful, token captured${NC}"
else
  echo -e "\n  ${RED}✗ Admin login failed. Check seed data.${NC}"
fi

# Test forgot password
run_test "POST" "/auth/forgot-password" '{"email":"admin@stayapp.com"}' "" "Forgot Password"

# ==========================================
# PHASE 3: User Endpoints (Auth Required)
# ==========================================
echo -e "\n${YELLOW}══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}${BOLD}PHASE 3: User Endpoints (Requires Auth)${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"

# Get current user (needs token)
USER_TOKEN="$ADMIN_TOKEN"
run_test "GET" "/auth/me" "" "USER" "Get Current User Profile"

# Logout
run_test "POST" "/auth/logout" "" "USER" "Logout"

# ==========================================
# PHASE 4: Admin Endpoints
# ==========================================
echo -e "\n${YELLOW}══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}${BOLD}PHASE 4: Admin Endpoints (Requires Admin)${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"

# Users management
run_test "GET" "/users" "" "ADMIN" "List All Users"
run_test "PUT" "/users/1" '{"name":"Updated Admin"}' "ADMIN" "Update User"

# Categories management
run_test "POST" "/categories" '{"name":"Luxury Villas","icon":"home"}' "ADMIN" "Create Category"
run_test "PUT" "/categories/1" '{"name":"Premium Apartments"}' "ADMIN" "Update Category"
run_test "DELETE" "/categories/1" "" "ADMIN" "Delete Category"

# Settings
run_test "GET" "/settings" "" "ADMIN" "Get Settings"
run_test "PUT" "/settings" '{"company_name":"StayFinder Inc","contact_email":"info@stayfinder.com"}' "ADMIN" "Update Settings"

# Property Management
run_test "POST" "/properties" '{"title":"Test Property","description":"A beautiful test property","location":"New York","monthly_price":1500,"bedrooms":2,"bathrooms":1,"property_type":"apartment","furnished":true,"category_id":1,"amenities":["wifi","parking"],"currency":"USD"}' "ADMIN" "Create Property"
run_test "PUT" "/properties/1" '{"title":"Updated Property","monthly_price":2000}' "ADMIN" "Update Property"
run_test "DELETE" "/properties/1" "" "ADMIN" "Delete Property"

# Payment Methods Management
run_test "POST" "/payment-methods/admin" '{"name":"Bank Transfer","details":"Account: 123456","icon":"bank"}' "ADMIN" "Create Payment Method"
run_test "PUT" "/payment-methods/admin/1" '{"name":"Wire Transfer","details":"Account: 654321"}' "ADMIN" "Update Payment Method"
run_test "DELETE" "/payment-methods/admin/1" "" "ADMIN" "Delete Payment Method"
run_test "PUT" "/payment-methods/property/1" '{"payment_method_ids":[1,2]}' "ADMIN" "Assign Payment Methods to Property"
run_test "GET" "/payment-methods/admin" "" "ADMIN" "Admin - All Payment Methods"

# Bookings Management
run_test "GET" "/bookings" "" "ADMIN" "Admin - All Bookings"
run_test "GET" "/bookings?status=pending" "" "ADMIN" "Admin - Filter Bookings by Status"

# ==========================================
# PHASE 5: Booking Flow (User Flow)
# ==========================================
echo -e "\n${YELLOW}══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}${BOLD}PHASE 5: Booking Flow${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"

# Create a booking (requires a valid property and user)
run_test "POST" "/bookings" '{"property_id":1,"move_in_date":"2026-06-01","move_out_date":"2026-09-01","months":3,"currency":"USD"}' "USER" "Create Booking"

# Get my bookings
run_test "GET" "/bookings/my" "" "USER" "Get My Bookings"

# Get booking details
run_test "GET" "/bookings/1" "" "USER" "Get Booking by ID"

# Update booking status (admin)
run_test "PUT" "/bookings/1/status" '{"status":"approved"}' "ADMIN" "Approve Booking"

# ==========================================
# PHASE 6: Payments
# ==========================================
echo -e "\n${YELLOW}══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}${BOLD}PHASE 6: Payments${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"

run_test "GET" "/payments" "" "" "Get Payments (empty handler)"
# run_test "POST" "/payments/1/screenshot" "" "USER" "Upload Payment Screenshot (requires multipart)"
run_test "PUT" "/payments/1/verify" '{"status":"completed"}' "ADMIN" "Verify Payment"

# ==========================================
# PHASE 7: Reviews
# ==========================================
echo -e "\n${YELLOW}══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}${BOLD}PHASE 7: Reviews${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"

run_test "GET" "/reviews/property/1" "" "" "Get Property Reviews"
run_test "POST" "/reviews" '{"property_id":1,"rating":5,"comment":"Amazing property!"}' "USER" "Create Review"

# ==========================================
# PHASE 8: Error Handling
# ==========================================
echo -e "\n${YELLOW}══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}${BOLD}PHASE 8: Error Handling${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"

run_test "POST" "/auth/register" '{"name":"","email":"invalid","password":"12"}' "" "Register with Invalid Data (expect 400)"
run_test "POST" "/auth/login" '{"email":"wrong@example.com","password":"wrong"}' "" "Login with Wrong Credentials (expect 401)"
run_test "GET" "/properties/99999" "" "" "Get Non-existent Property (expect 404)"
run_test "GET" "/bookings/99999" "" "USER" "Get Non-existent Booking (expect 404)"

# ==========================================
# SUMMARY
# ==========================================
echo -e "\n${BLUE}══════════════════════════════════════════════${NC}"
echo -e "${BOLD}  TEST SUMMARY${NC}"
echo -e "${BLUE}══════════════════════════════════════════════${NC}"
echo -e "  Total:  ${TOTAL}"
echo -e "  ${GREEN}Passed: ${PASS}${NC}"
echo -e "  ${RED}Failed: ${FAIL}${NC}"
echo -e ""

if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}ALL TESTS PASSED!${NC}"
else
  echo -e "  ${RED}${BOLD}Some tests failed. Review the output above.${NC}"
fi

echo ""
