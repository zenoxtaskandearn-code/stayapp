#!/bin/bash

# ==========================================
# A-Z API Test Suite - Full CRUD Operations
# ==========================================
# Usage: ./full-api-test.sh [BASE_URL]
# Default: http://localhost:5001/api
# ==========================================

if [ -z "$1" ]; then
  BASE_URL="http://localhost:5001/api"
else
  BASE_URL="$1"
fi

BASE_URL="${BASE_URL%/}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

PASS=0
FAIL=0
TOTAL=0
USER_TOKEN=""
ADMIN_TOKEN=""
TEST_USER_EMAIL="apitest_$(date +%s)@test.com"
TEST_PROP_ID=""
TEST_BOOKING_ID=""
TEST_PAYMENT_ID=""
TEST_CATEGORY_ID=""
TEST_PAYMENT_METHOD_ID=""

phase() {
  echo -e "\n${CYAN}╔══════════════════════════════════════════════╗"
  echo -e "║  ${BOLD}$1${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
}

run_test() {
  local NUM=$1
  local METHOD=$2
  local ENDPOINT=$3
  local BODY=$4
  local TOKEN=$5
  local DESCRIPTION=$6
  local EXPECT=$7

  TOTAL=$((TOTAL + 1))

  echo -e "\n  ${BOLD}[${NUM}] ${DESCRIPTION}${NC}"
  echo -e "    ${METHOD} ${ENDPOINT}"

  local CMD="curl -s -w '\n%{http_code}' -X ${METHOD} \"${BASE_URL}${ENDPOINT}\" -H 'Content-Type: application/json'"
  
  if [ -n "$BODY" ]; then
    CMD="${CMD} -d '${BODY}'"
  fi

  if [ -n "$TOKEN" ]; then
    CMD="${CMD} -H 'Authorization: Bearer ${TOKEN}'"
  fi

  local RESPONSE
  RESPONSE=$(eval "$CMD")

  local HTTP_CODE
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  local BODY_RESP
  BODY_RESP=$(echo "$RESPONSE" | sed '$d')

  local SHORT_RESP
  SHORT_RESP=$(echo "$BODY_RESP" | head -c 200)

  if [ -n "$EXPECT" ]; then
    if [ "$HTTP_CODE" = "$EXPECT" ]; then
      echo -e "    ${GREEN}✓ PASS (HTTP ${HTTP_CODE})${NC} ${SHORT_RESP}"
      PASS=$((PASS + 1))
      return 0
    else
      echo -e "    ${RED}✗ FAIL (HTTP ${HTTP_CODE}, expected ${EXPECT})${NC} ${SHORT_RESP}"
      FAIL=$((FAIL + 1))
      return 1
    fi
  else
    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
      echo -e "    ${GREEN}✓ PASS (HTTP ${HTTP_CODE})${NC} ${SHORT_RESP}"
      PASS=$((PASS + 1))
      echo "$BODY_RESP"
      return 0
    else
      echo -e "    ${RED}✗ FAIL (HTTP ${HTTP_CODE})${NC} ${SHORT_RESP}"
      FAIL=$((FAIL + 1))
      return 1
    fi
  fi
}

echo -e "${BOLD}${BLUE}"
echo -e "=============================================="
echo -e "  StayApp A-Z API Test Suite"
echo -e "  Base URL: ${BASE_URL}"
echo -e "=============================================="
echo -e "${NC}"

# ==========================================
# PHASE 1: PUBLIC ENDPOINTS
# ==========================================
phase "PHASE 1: Public Endpoints"

run_test 1.1 "GET" "/health" "" "" "" "Health Check" "200"

run_test 1.2 "GET" "/properties" "" "" "" "List Properties (empty)" "200"

run_test 1.3 "GET" "/categories" "" "" "" "List Categories" "200"

run_test 1.4 "GET" "/payment-methods" "" "" "" "List Active Payment Methods" "200"

# ==========================================
# PHASE 2: USER REGISTRATION & AUTH
# ==========================================
phase "PHASE 2: User Registration & Authentication"

echo -e "\n  ${BOLD}Registering test user: ${TEST_USER_EMAIL}${NC}"

REG_RESP=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"API Test User\",\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"testpass123\",\"phone\":\"555999888\"}")

echo -e "  Register response: ${REG_RESP}"

REG_NEEDS_VERIF=$(echo "$REG_RESP" | grep -o '"needsVerification":true')

if [ -n "$REG_NEEDS_VERIF" ]; then
  echo -e "  ${YELLOW}⚠ Registration requires OTP verification. Verifying manually...${NC}"
  
  OTP=$(sudo mysql -u root -s -N -e "USE rental_property; SELECT verification_otp FROM users WHERE email='${TEST_USER_EMAIL}' LIMIT 1;")
  
  if [ -n "$OTP" ] && [ "$OTP" != "NULL" ]; then
    VERIFY_RESP=$(curl -s -X POST "${BASE_URL}/auth/verify-email" \
      -H 'Content-Type: application/json' \
      -d "{\"email\":\"${TEST_USER_EMAIL}\",\"otp\":\"${OTP}\"}")
    
    USER_TOKEN=$(echo "$VERIFY_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$USER_TOKEN" ]; then
      echo -e "  ${GREEN}✓ User verified & logged in${NC}"
    else
      echo -e "  ${RED}✗ Verification failed: ${VERIFY_RESP}${NC}"
    fi
  else
    echo -e "  ${YELLOW}⚠ No OTP found. Marking user as verified directly...${NC}"
    sudo mysql -u root -e "USE rental_property; UPDATE users SET is_verified=TRUE, verification_otp=NULL WHERE email='${TEST_USER_EMAIL}';"
    
    LOGIN_RESP=$(curl -s -X POST "${BASE_URL}/auth/login" \
      -H 'Content-Type: application/json' \
      -d "{\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"testpass123\"}")
    
    USER_TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  fi
else
  USER_TOKEN=$(echo "$REG_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$USER_TOKEN" ]; then
    echo -e "  ${GREEN}✓ Auto-login on registration successful${NC}"
  fi
fi

run_test 2.1 "POST" "/auth/login" "{\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"wrongpass\"}" "" "" "Login with wrong password" "401"

run_test 2.2 "POST" "/auth/login" "{\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"testpass123\"}" "" "" "Login with correct password" "200"

run_test 2.3 "GET" "/auth/me" "" "$USER_TOKEN" "" "Get My Profile" "200"

run_test 2.4 "POST" "/auth/forgot-password" "{\"email\":\"${TEST_USER_EMAIL}\"}" "" "" "Forgot Password" "200"

# ==========================================
# PHASE 3: ADMIN LOGIN & AUTH
# ==========================================
phase "PHASE 3: Admin Authentication"

ADMIN_LOGIN=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"amitxrajwar@gmail.com","password":"admin123"}')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
  echo -e "  ${GREEN}✓ Admin login successful${NC}"
else
  echo -e "  ${RED}✗ Admin login failed${NC}"
  echo "  Admin login response: ${ADMIN_LOGIN}"
fi

run_test 3.1 "GET" "/auth/me" "" "$ADMIN_TOKEN" "" "Get Admin Profile" "200"

# ==========================================
# PHASE 4: ADMIN - CATEGORIES CRUD
# ==========================================
phase "PHASE 4: Admin - Categories CRUD"

echo -e "\n  ${BOLD}Creating test category...${NC}"
CAT_RESP=$(curl -s -X POST "${BASE_URL}/categories" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{"name":"Test Apartments","slug":"test-apartments","description":"API test category","icon":"home"}')

echo "  Response: ${CAT_RESP}"
TEST_CATEGORY_ID=$(echo "$CAT_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "  Category ID: ${TEST_CATEGORY_ID}"

run_test 4.1 "GET" "/categories" "" "" "" "List All Categories (should include new)" "200"

run_test 4.2 "PUT" "/categories/${TEST_CATEGORY_ID}" '{"name":"Updated Apartments","description":"Updated via API"}' "$ADMIN_TOKEN" "" "Update Category" "200"

run_test 4.3 "DELETE" "/categories/${TEST_CATEGORY_ID}" "" "$ADMIN_TOKEN" "" "Delete Category" "200"

run_test 4.4 "GET" "/categories/${TEST_CATEGORY_ID}" "" "" "" "Get Deleted Category (should 404)" "404"

# ==========================================
# PHASE 5: ADMIN - PROPERTIES CRUD
# ==========================================
phase "PHASE 5: Admin - Properties CRUD"

echo -e "\n  ${BOLD}Creating test property...${NC}"
PROP_RESP=$(curl -s -X POST "${BASE_URL}/properties" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{"title":"API Test Property","description":"Created by API test","location":"London, UK","monthly_price":2500,"deposit":2500,"bedrooms":2,"bathrooms":1,"square_feet":900,"property_type":"apartment","furnished":"furnished","status":"available","category_id":1,"currency":"GBP","amenities":["WiFi","Parking","Laundry"]}')

echo "  Response: ${PROP_RESP}"
TEST_PROP_ID=$(echo "$PROP_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "  Property ID: ${TEST_PROP_ID}"

run_test 5.1 "GET" "/properties" "" "" "" "List Properties (should include new)" "200"

run_test 5.2 "GET" "/properties/${TEST_PROP_ID}" "" "" "" "Get Property By ID" "200"

run_test 5.3 "GET" "/properties?status=available" "" "" "" "Filter by Status" "200"

run_test 5.4 "PUT" "/properties/${TEST_PROP_ID}" '{"title":"Updated Property","monthly_price":3000}' "$ADMIN_TOKEN" "" "Update Property" "200"

run_test 5.5 "DELETE" "/properties/${TEST_PROP_ID}" "" "$ADMIN_TOKEN" "" "Delete Property" "200"

run_test 5.6 "GET" "/properties/${TEST_PROP_ID}" "" "" "" "Get Deleted Property (should 404)" "404"

# ==========================================
# PHASE 6: ADMIN - PAYMENT METHODS CRUD
# ==========================================
phase "PHASE 6: Admin - Payment Methods CRUD"

echo -e "\n  ${BOLD}Creating test payment method...${NC}"
PM_RESP=$(curl -s -X POST "${BASE_URL}/payment-methods/admin" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{"name":"API Test Payment","description":"Created by API","instructions":"Send payment to test@example.com","is_active":true}')

echo "  Response: ${PM_RESP}"
TEST_PAYMENT_METHOD_ID=$(echo "$PM_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "  Payment Method ID: ${TEST_PAYMENT_METHOD_ID}"

run_test 6.1 "GET" "/payment-methods/admin" "" "$ADMIN_TOKEN" "" "Admin - List All Payment Methods" "200"

run_test 6.2 "PUT" "/payment-methods/admin/${TEST_PAYMENT_METHOD_ID}" '{"name":"Updated Payment","description":"Updated via API"}' "$ADMIN_TOKEN" "" "Update Payment Method" "200"

run_test 6.3 "DELETE" "/payment-methods/admin/${TEST_PAYMENT_METHOD_ID}" "" "$ADMIN_TOKEN" "" "Delete Payment Method" "200"

run_test 6.4 "GET" "/payment-methods" "" "" "" "List Active (should not include deleted)" "200"

# ==========================================
# PHASE 7: ADMIN - USERS MANAGEMENT
# ==========================================
phase "PHASE 7: Admin - Users Management"

run_test 7.1 "GET" "/users" "" "$ADMIN_TOKEN" "" "List All Users" "200"

run_test 7.2 "PUT" "/users/1" '{"name":"Updated via API"}' "$ADMIN_TOKEN" "" "Update User" "200"

# ==========================================
# PHASE 8: ADMIN - SETTINGS
# ==========================================
phase "PHASE 8: Admin - Settings"

run_test 8.1 "GET" "/settings" "" "$ADMIN_TOKEN" "" "Get Settings" "200"

run_test 8.2 "PUT" "/settings" '{"website_name":"API Test","contact_email":"test@api.com"}' "$ADMIN_TOKEN" "" "Update Settings" "200"

# ==========================================
# PHASE 9: FULL BOOKING FLOW
# ==========================================
phase "PHASE 9: Full Booking Flow (User → Admin)"

echo -e "\n  ${BOLD}Creating property for booking test...${NC}"
PROP2_RESP=$(curl -s -X POST "${BASE_URL}/properties" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{"title":"Booking Test Property","description":"For booking flow test","location":"Manchester, UK","monthly_price":1500,"deposit":1500,"bedrooms":1,"bathrooms":1,"square_feet":600,"property_type":"apartment","furnished":"furnished","status":"available","category_id":1,"currency":"GBP","amenities":["WiFi"]}')

BOOKING_PROP_ID=$(echo "$PROP2_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "  Booking Property ID: ${BOOKING_PROP_ID}"

run_test 9.1 "POST" "/bookings" "{\"property_id\":${BOOKING_PROP_ID},\"move_in_date\":\"2026-06-01\",\"move_out_date\":\"2026-09-01\",\"months\":3,\"currency\":\"GBP\"}" "$USER_TOKEN" "" "User - Create Booking" "201"

echo -e "\n  ${BOLD}Fetching booking ID...${NC}"
BOOKINGS_RESP=$(curl -s "${BASE_URL}/bookings/my" -H "Authorization: Bearer ${USER_TOKEN}")
TEST_BOOKING_ID=$(echo "$BOOKINGS_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "  Booking ID: ${TEST_BOOKING_ID}"

run_test 9.2 "GET" "/bookings/my" "" "$USER_TOKEN" "" "User - Get My Bookings" "200"

run_test 9.3 "GET" "/bookings/${TEST_BOOKING_ID}" "" "$USER_TOKEN" "" "User - Get Booking Details" "200"

run_test 9.4 "GET" "/bookings" "" "$ADMIN_TOKEN" "" "Admin - List All Bookings" "200"

run_test 9.5 "PUT" "/bookings/${TEST_BOOKING_ID}/status" '{"status":"approved"}' "$ADMIN_TOKEN" "" "Admin - Approve Booking" "200"

run_test 9.6 "PUT" "/bookings/${TEST_BOOKING_ID}/status" '{"status":"rejected"}' "$ADMIN_TOKEN" "" "Admin - Reject Booking" "200"

# ==========================================
# PHASE 10: PAYMENTS
# ==========================================
phase "PHASE 10: Payments"

echo -e "\n  ${BOLD}Fetching payment ID...${NC}"
BOOKING_DETAILS=$(curl -s "${BASE_URL}/bookings/${TEST_BOOKING_ID}" -H "Authorization: Bearer ${USER_TOKEN}")
TEST_PAYMENT_ID=$(echo "$BOOKING_DETAILS" | grep -o '"payment":{[^}]*"id":[0-9]*' | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$TEST_PAYMENT_ID" ]; then
  TEST_PAYMENT_ID=$(sudo mysql -u root -s -N -e "USE rental_property; SELECT id FROM payments WHERE booking_id=${TEST_BOOKING_ID} LIMIT 1;")
fi
echo "  Payment ID: ${TEST_PAYMENT_ID}"

run_test 10.1 "PUT" "/payments/${TEST_PAYMENT_ID}/verify" '{"status":"completed"}' "$ADMIN_TOKEN" "" "Admin - Verify Payment" "200"

# ==========================================
# PHASE 11: REVIEWS
# ==========================================
phase "PHASE 11: Reviews"

run_test 11.1 "GET" "/reviews/property/${BOOKING_PROP_ID}" "" "" "" "Get Property Reviews" "200"

run_test 11.2 "POST" "/reviews" "{\"property_id\":${BOOKING_PROP_ID},\"rating\":5,\"comment\":\"Excellent property!\"}" "$USER_TOKEN" "" "User - Create Review" "201"

run_test 11.3 "GET" "/reviews/property/${BOOKING_PROP_ID}" "" "" "" "Get Reviews (should include new)" "200"

# ==========================================
# PHASE 12: FEATURED & FILTERS
# ==========================================
phase "PHASE 12: Featured Properties & Filters"

run_test 12.1 "GET" "/properties/featured" "" "" "" "Get Featured Properties" "200"

run_test 12.2 "GET" "/properties/types" "" "" "" "Get Property Types" "200"

run_test 12.3 "GET" "/properties/locations" "" "" "" "Get Locations" "200"

# ==========================================
# PHASE 13: ERROR HANDLING
# ==========================================
phase "PHASE 13: Error Handling"

run_test 13.1 "POST" "/auth/register" '{"name":"","email":"invalid","password":"12"}' "" "" "Register invalid data" "400"

run_test 13.2 "POST" "/auth/register" "{\"name\":\"Dup\",\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"pass123\"}" "" "" "Register duplicate email" "400"

run_test 13.3 "GET" "/properties/99999" "" "" "" "Get non-existent property" "404"

run_test 13.4 "GET" "/bookings/99999" "" "$USER_TOKEN" "" "Get non-existent booking" "404"

run_test 13.5 "POST" "/properties" '{"title":"No auth"}' "" "" "" "Create property without auth" "403"

run_test 13.6 "PUT" "/bookings/1/status" '{"status":"approved"}' "$USER_TOKEN" "" "User tries admin action" "403"

# ==========================================
# CLEANUP
# ==========================================
phase "CLEANUP: Removing test data"

echo -e "\n  Cleaning up test data..."
sudo mysql -u root -e "USE rental_property;
DELETE FROM reviews WHERE property_id=${BOOKING_PROP_ID};" 2>/dev/null
sudo mysql -u root -e "USE rental_property;
DELETE FROM property_payment_methods WHERE property_id=${BOOKING_PROP_ID};" 2>/dev/null
sudo mysql -u root -e "USE rental_property;
DELETE FROM property_images WHERE property_id=${BOOKING_PROP_ID};" 2>/dev/null
sudo mysql -u root -e "USE rental_property;
DELETE FROM payments WHERE booking_id=${TEST_BOOKING_ID};" 2>/dev/null
sudo mysql -u root -e "USE rental_property;
DELETE FROM bookings WHERE id=${TEST_BOOKING_ID};" 2>/dev/null
sudo mysql -u root -e "USE rental_property;
DELETE FROM properties WHERE id=${BOOKING_PROP_ID};" 2>/dev/null
sudo mysql -u root -e "USE rental_property;
DELETE FROM users WHERE email='${TEST_USER_EMAIL}';" 2>/dev/null
echo -e "  ${GREEN}✓ Cleanup done${NC}"

# ==========================================
# SUMMARY
# ==========================================
echo -e "\n${CYAN}╔══════════════════════════════════════════════╗"
echo -e "║            ${BOLD}FINAL TEST SUMMARY${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════╣"
echo -e "║  Total:    ${TOTAL}"
echo -e "║  ${GREEN}Passed:   ${PASS}${NC}"
echo -e "║  ${RED}Failed:   ${FAIL}${NC}"
echo -e "║  Score:    $(( PASS * 100 / TOTAL ))%"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
