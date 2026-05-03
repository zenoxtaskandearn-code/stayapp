#!/bin/bash

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

do_test() {
  local num="$1"
  local method="$2"
  local endpoint="$3"
  local description="$4"
  local expect="${5:-}"

  shift 5
  local token=""
  local body=""

  while [ $# -gt 0 ]; do
    case "$1" in
      --token) token="$2"; shift 2 ;;
      --body)  body="$2"; shift 2 ;;
      *)       shift ;;
    esac
  done

  TOTAL=$((TOTAL + 1))
  echo -e "\n  ${BOLD}[${num}] ${description}${NC}"
  echo -e "    ${method} ${endpoint}"

  local cmd="curl -s -w '\n%{http_code}' -X ${method} '${BASE_URL}${endpoint}' -H 'Content-Type: application/json'"
  if [ -n "$body" ]; then
    cmd="${cmd} -d '${body}'"
  fi
  if [ -n "$token" ]; then
    cmd="${cmd} -H 'Authorization: Bearer ${token}'"
  fi

  local resp
  resp=$(eval "$cmd" 2>/dev/null)

  local http_code
  http_code=$(echo "$resp" | tail -1)
  local resp_body
  resp_body=$(echo "$resp" | sed '$d')
  local short
  short=$(echo "$resp_body" | head -c 200)

  if [ -n "$expect" ]; then
    if [ "$http_code" = "$expect" ]; then
      echo -e "    ${GREEN}✓ PASS (HTTP ${http_code})${NC}"
      PASS=$((PASS + 1))
    else
      echo -e "    ${RED}✗ FAIL (HTTP ${http_code}, expected ${expect})${NC}"
      echo -e "    ${short}"
      FAIL=$((FAIL + 1))
    fi
  else
    if [ "$http_code" -ge 200 ] 2>/dev/null && [ "$http_code" -lt 300 ] 2>/dev/null; then
      echo -e "    ${GREEN}✓ PASS (HTTP ${http_code})${NC}"
      PASS=$((PASS + 1))
    else
      echo -e "    ${RED}✗ FAIL (HTTP ${http_code})${NC}"
      echo -e "    ${short}"
      FAIL=$((FAIL + 1))
    fi
  fi

  echo "$resp_body"
}

echo -e "${BOLD}${BLUE}"
echo "=============================================="
echo "  StayApp Full API Test Suite"
echo "  Base: ${BASE_URL}"
echo "=============================================="
echo -e "${NC}"

# ---- Phase 1: Health ----
echo -e "\n${CYAN}=== Phase 1: Health ===${NC}"
do_test "1.1" "GET" "/health" "Health Check" "200" > /dev/null

# ---- Phase 2: Admin Login ----
echo -e "\n${CYAN}=== Phase 2: Admin Login ===${NC}"
ADMIN_RESP=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"amitxrajwar@gmail.com","password":"admin123"}')
ADMIN_TOKEN=$(echo "$ADMIN_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$ADMIN_TOKEN" ]; then
  echo -e "  ${GREEN}✓ Admin login OK${NC}"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗ Admin login FAILED${NC}"
  FAIL=$((FAIL + 1))
fi
TOTAL=$((TOTAL + 1))

# ---- Phase 3: Admin Profile ----
do_test "3.1" "GET" "/auth/me" "Admin Profile" "200" --token "$ADMIN_TOKEN" > /dev/null

# ---- Phase 4: Users ----
echo -e "\n${CYAN}=== Phase 4: Users ===${NC}"
do_test "4.1" "GET" "/users" "List Users" "200" --token "$ADMIN_TOKEN" > /dev/null

# ---- Phase 5: Categories CRUD ----
echo -e "\n${CYAN}=== Phase 5: Categories CRUD ===${NC}"

# Create
CAT_RESP=$(curl -s -X POST "${BASE_URL}/categories" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{"name":"TestCat '$(date +%s)'","slug":"test-cat","icon":"home"}')
CAT_ID=$(echo "$CAT_RESP" | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ -n "$CAT_ID" ]; then
  echo -e "  ${GREEN}✓ Create category (ID: ${CAT_ID})${NC}"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗ Create category FAILED${NC}"
  FAIL=$((FAIL + 1))
fi
TOTAL=$((TOTAL + 1))

# Read
do_test "5.2" "GET" "/categories" "List Categories" "200" > /dev/null

# Update
do_test "5.3" "PUT" "/categories/${CAT_ID}" "Update Category" "200" \
  --token "$ADMIN_TOKEN" \
  --body '{"name":"Updated Cat"}' > /dev/null

# Delete
do_test "5.4" "DELETE" "/categories/${CAT_ID}" "Delete Category" "200" --token "$ADMIN_TOKEN" > /dev/null

# ---- Phase 6: Properties CRUD ----
echo -e "\n${CYAN}=== Phase 6: Properties CRUD ===${NC}"

# Create
PROP_RESP=$(curl -s -X POST "${BASE_URL}/properties" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{"title":"Test Property '$(date +%s)'","description":"API test","location":"London, UK","monthly_price":2000,"deposit":2000,"bedrooms":2,"bathrooms":1,"square_feet":800,"property_type":"apartment","furnished":"furnished","status":"available","amenities":["WiFi"]}')
PROP_ID=$(echo "$PROP_RESP" | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ -n "$PROP_ID" ]; then
  echo -e "  ${GREEN}✓ Create property (ID: ${PROP_ID})${NC}"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗ Create property FAILED: ${PROP_RESP}${NC}"
  FAIL=$((FAIL + 1))
fi
TOTAL=$((TOTAL + 1))

# List
do_test "6.2" "GET" "/properties" "List Properties" "200" > /dev/null

# Get by ID
do_test "6.3" "GET" "/properties/${PROP_ID}" "Get Property" "200" > /dev/null

# Update
do_test "6.4" "PUT" "/properties/${PROP_ID}" "Update Property" "200" \
  --token "$ADMIN_TOKEN" \
  --body '{"monthly_price":2500}' > /dev/null

# Delete
do_test "6.5" "DELETE" "/properties/${PROP_ID}" "Delete Property" "200" --token "$ADMIN_TOKEN" > /dev/null

# Verify deleted
do_test "6.6" "GET" "/properties/${PROP_ID}" "Deleted Property 404" "404" > /dev/null

# ---- Phase 7: Payment Methods CRUD ----
echo -e "\n${CYAN}=== Phase 7: Payment Methods CRUD ===${NC}"

# Create
PM_RESP=$(curl -s -X POST "${BASE_URL}/payment-methods/admin" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{"name":"Test PM '$(date +%s)'","description":"API test","instructions":"Send to test@test.com"}')
PM_ID=$(echo "$PM_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
if [ -n "$PM_ID" ]; then
  echo -e "  ${GREEN}✓ Create payment method (ID: ${PM_ID})${NC}"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗ Create payment method FAILED: ${PM_RESP}${NC}"
  FAIL=$((FAIL + 1))
fi
TOTAL=$((TOTAL + 1))

# List admin
do_test "7.2" "GET" "/payment-methods/admin" "Admin List Payment Methods" "200" --token "$ADMIN_TOKEN" > /dev/null

# Update
do_test "7.3" "PUT" "/payment-methods/admin/${PM_ID}" "Update Payment Method" "200" \
  --token "$ADMIN_TOKEN" \
  --body '{"name":"Updated PM"}' > /dev/null

# Delete
do_test "7.4" "DELETE" "/payment-methods/admin/${PM_ID}" "Delete Payment Method" "200" --token "$ADMIN_TOKEN" > /dev/null

# ---- Phase 8: Settings ----
echo -e "\n${CYAN}=== Phase 8: Settings ===${NC}"
do_test "8.1" "GET" "/settings" "Get Settings" "200" --token "$ADMIN_TOKEN" > /dev/null
do_test "8.2" "PUT" "/settings" "Update Settings" "200" \
  --token "$ADMIN_TOKEN" \
  --body '{"website_name":"Test Site"}' > /dev/null

# ---- Phase 9: Registration + User Flow ----
echo -e "\n${CYAN}=== Phase 9: Registration + User Flow ===${NC}"

USER_EMAIL="apitest_$(date +%s)@test.com"
REG_RESP=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"API User\",\"email\":\"${USER_EMAIL}\",\"password\":\"pass123\",\"phone\":\"5551234\"}")

USER_TOKEN=$(echo "$REG_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$USER_TOKEN" ]; then
  echo -e "  ${GREEN}✓ Register + auto-login OK${NC}"
  PASS=$((PASS + 1))
else
  echo -e "  ${YELLOW}⚠ Registration needs verification, marking user verified...${NC}"
  sudo mysql -u root -e "USE rental_property; UPDATE users SET is_verified=TRUE WHERE email='${USER_EMAIL}';" 2>/dev/null
  LOGIN_RESP=$(curl -s -X POST "${BASE_URL}/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"${USER_EMAIL}\",\"password\":\"pass123\"}")
  USER_TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$USER_TOKEN" ]; then
    echo -e "  ${GREEN}✓ Login after verification OK${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗ User login FAILED${NC}"
    FAIL=$((FAIL + 1))
  fi
fi
TOTAL=$((TOTAL + 1))

# User profile
do_test "9.2" "GET" "/auth/me" "User Profile" "200" --token "$USER_TOKEN" > /dev/null

# Wrong password
do_test "9.3" "POST" "/auth/login" "Wrong password 401" "401" \
  --body "{\"email\":\"${USER_EMAIL}\",\"password\":\"wrong\"}" > /dev/null

# Duplicate email
do_test "9.4" "POST" "/auth/register" "Duplicate email 400" "400" \
  --body "{\"name\":\"Dup\",\"email\":\"${USER_EMAIL}\",\"password\":\"pass123\"}" > /dev/null

# ---- Phase 10: Booking Flow ----
echo -e "\n${CYAN}=== Phase 10: Booking Flow ===${NC}"

# Create property for booking
PROP2_RESP=$(curl -s -X POST "${BASE_URL}/properties" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{"title":"Booking Property '$(date +%s)'","description":"For booking","location":"Manchester, UK","monthly_price":1500,"deposit":1500,"bedrooms":1,"bathrooms":1,"square_feet":500,"property_type":"apartment","furnished":"furnished","status":"available","amenities":["WiFi"]}')
PROP2_ID=$(echo "$PROP2_RESP" | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo -e "  Booking property ID: ${PROP2_ID}"

# Create booking
BOOKING_RESP=$(curl -s -X POST "${BASE_URL}/bookings" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -d "{\"property_id\":${PROP2_ID},\"move_in_date\":\"2026-06-01\",\"move_out_date\":\"2026-09-01\",\"months\":3,\"currency\":\"GBP\"}")

BOOKING_ID=$(echo "$BOOKING_RESP" | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ -n "$BOOKING_ID" ]; then
  echo -e "  ${GREEN}✓ Create booking (ID: ${BOOKING_ID})${NC}"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗ Create booking FAILED: ${BOOKING_RESP}${NC}"
  FAIL=$((FAIL + 1))
fi
TOTAL=$((TOTAL + 1))

# Get my bookings
do_test "10.3" "GET" "/bookings/my" "My Bookings" "200" --token "$USER_TOKEN" > /dev/null

# Get booking detail
do_test "10.4" "GET" "/bookings/${BOOKING_ID}" "Booking Details" "200" --token "$USER_TOKEN" > /dev/null

# Admin list bookings
do_test "10.5" "GET" "/bookings" "Admin List Bookings" "200" --token "$ADMIN_TOKEN" > /dev/null

# Admin approve
do_test "10.6" "PUT" "/bookings/${BOOKING_ID}/status" "Approve Booking" "200" \
  --token "$ADMIN_TOKEN" \
  --body '{"status":"approved"}' > /dev/null

# ---- Phase 11: Payments ----
echo -e "\n${CYAN}=== Phase 11: Payments ===${NC}"

PAYMENT_ID=$(sudo mysql -u root -s -N -e "USE rental_property; SELECT id FROM payments WHERE booking_id=${BOOKING_ID} LIMIT 1;" 2>/dev/null)
echo -e "  Payment ID: ${PAYMENT_ID}"

if [ -n "$PAYMENT_ID" ]; then
  do_test "11.1" "PUT" "/payments/${PAYMENT_ID}/verify" "Verify Payment" "200" \
    --token "$ADMIN_TOKEN" \
    --body '{"status":"completed"}' > /dev/null
fi

# ---- Phase 12: Reviews ----
echo -e "\n${CYAN}=== Phase 12: Reviews ===${NC}"

do_test "12.1" "GET" "/reviews/property/${PROP2_ID}" "Get Reviews" "200" > /dev/null

do_test "12.2" "POST" "/reviews" "Create Review" "201" \
  --token "$USER_TOKEN" \
  --body "{\"property_id\":${PROP2_ID},\"rating\":5,\"comment\":\"Great!\"}" > /dev/null

# ---- Phase 13: Error Handling ----
echo -e "\n${CYAN}=== Phase 13: Error Handling ===${NC}"

do_test "13.1" "GET" "/properties/99999" "Non-existent property 404" "404" > /dev/null
do_test "13.2" "GET" "/bookings/99999" "Non-existent booking 404" "404" --token "$USER_TOKEN" > /dev/null
do_test "13.3" "POST" "/properties" "Create without auth 403" "403" \
  --body '{"title":"No auth"}' > /dev/null
do_test "13.4" "POST" "/auth/register" "Invalid data 400" "400" \
  --body '{"name":"","email":"invalid","password":"12"}' > /dev/null

# ---- Cleanup ----
echo -e "\n${CYAN}=== Cleanup ===${NC}"
sudo mysql -u root -e "USE rental_property;
DELETE FROM reviews WHERE property_id=${PROP2_ID};" 2>/dev/null
sudo mysql -u root -e "USE rental_property;
DELETE FROM property_payment_methods WHERE property_id=${PROP2_ID};" 2>/dev/null
sudo mysql -u root -e "USE rental_property;
DELETE FROM property_images WHERE property_id=${PROP2_ID};" 2>/dev/null
sudo mysql -u root -e "USE rental_property;
DELETE FROM payments WHERE booking_id=${BOOKING_ID};" 2>/dev/null
sudo mysql -u root -e "USE rental_property;
DELETE FROM bookings WHERE id=${BOOKING_ID};" 2>/dev/null
sudo mysql -u root -e "USE rental_property;
DELETE FROM properties WHERE id=${PROP2_ID};" 2>/dev/null
sudo mysql -u root -e "USE rental_property;
DELETE FROM users WHERE email='${USER_EMAIL}';" 2>/dev/null
echo -e "  ${GREEN}✓ Cleaned up${NC}"

# ---- Summary ----
echo -e "\n${CYAN}╔══════════════════════════════════════════════╗"
echo -e "║          ${BOLD}FINAL SUMMARY${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════╣"
echo -e "║  Total:  ${TOTAL}"
echo -e "║  ${GREEN}Passed: ${PASS}${NC}"
echo -e "║  ${RED}Failed: ${FAIL}${NC}"
if [ $TOTAL -gt 0 ]; then
  echo -e "║  Score:  $(( PASS * 100 / TOTAL ))%"
fi
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
