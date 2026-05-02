import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API = 'http://localhost:5000/api';
const client = axios.create({ baseURL: API, withCredentials: true });

let adminToken = '';
let userToken = '';
let adminId = '';
let userId = '';
let propertyId = '';
let bookingId = '';
let paymentId = '';

// Helper to log results
const log = (test, success, data = null) => {
  console.log(`${success ? '✅' : '❌'} ${test}`);
  if (data && !success) console.error('  Error:', data);
  if (data && success && typeof data === 'object') console.log('  Data:', JSON.stringify(data).slice(0, 100));
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const runTests = async () => {
  console.log('🚀 Starting API Tests...\n');

  // ==================== AUTH TESTS ====================
  console.log('📧 AUTH ENDPOINTS');
  console.log('='.repeat(50));

  // Test 1: Register Admin
  try {
    const res = await client.post('/auth/register', {
      name: 'Admin Test',
      email: `admin${Date.now()}@test.com`,
      password: 'admin123',
      phone: '+1234567890',
    });
    adminToken = res.data.token;
    adminId = res.data.user.id;
    log('POST /auth/register (admin)', true, res.data.user);
  } catch (e) {
    log('POST /auth/register (admin)', false, e.response?.data);
  }

  await sleep(500);

  // Test 2: Register User
  try {
    const res = await client.post('/auth/register', {
      name: 'User Test',
      email: `user${Date.now()}@test.com`,
      password: 'user123',
      phone: '+0987654321',
    });
    userToken = res.data.token;
    userId = res.data.user.id;
    log('POST /auth/register (user)', true, res.data.user);
  } catch (e) {
    log('POST /auth/register (user)', false, e.response?.data);
  }

  await sleep(500);

  // Test 3: Login
  try {
    const res = await client.post('/auth/login', {
      email: 'admin@premiumstays.com',
      password: 'admin123',
    });
    log('POST /auth/login', true, { id: res.data.user.id, role: res.data.user.role });
  } catch (e) {
    log('POST /auth/login', false, e.response?.data);
  }

  await sleep(500);

  // Test 4: Get Me (authenticated)
  try {
    const res = await client.get('/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    log('GET /auth/me', true, res.data);
  } catch (e) {
    log('GET /auth/me', false, e.response?.data);
  }

  await sleep(500);

  // Test 5: Logout
  try {
    const res = await client.post('/auth/logout');
    log('POST /auth/logout', true, res.data);
  } catch (e) {
    log('POST /auth/logout', false, e.response?.data);
  }

  console.log('\n');

  // ==================== SETTINGS TESTS ====================
  console.log('⚙️ SETTINGS ENDPOINTS');
  console.log('='.repeat(50));

  // Test 6: Get Settings (public)
  try {
    const res = await client.get('/settings');
    log('GET /settings', true, res.data);
  } catch (e) {
    log('GET /settings', false, e.response?.data);
  }

  await sleep(500);

  // Test 7: Update Settings (admin only)
  try {
    const res = await client.put(
      '/settings',
      {
        website_name: 'Premium Stays Test',
        theme_color: '#ef4444',
        footer_text: 'Test Footer',
        contact_email: 'test@premiumstays.com',
        contact_phone: '+1234567890',
        payment_instructions: 'Test payment instructions',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    log('PUT /settings', true, res.data);
  } catch (e) {
    log('PUT /settings', false, e.response?.data);
  }

  console.log('\n');

  // ==================== PROPERTIES TESTS ====================
  console.log('🏠 PROPERTIES ENDPOINTS');
  console.log('='.repeat(50));

  // Test 8: Get Properties (public)
  try {
    const res = await client.get('/properties');
    log('GET /properties', true, { count: res.data.properties?.length });
  } catch (e) {
    log('GET /properties', false, e.response?.data);
  }

  await sleep(500);

  // Test 9: Get Featured Properties
  try {
    const res = await client.get('/properties/featured');
    log('GET /properties/featured', true, { count: res.data.length });
  } catch (e) {
    log('GET /properties/featured', false, e.response?.data);
  }

  await sleep(500);

  // Test 10: Create Property (admin)
  try {
    const res = await client.post(
      '/properties',
      {
        title: 'Test Property API',
        description: 'A test property for API testing',
        location: 'Test City, TC',
        monthly_price: 2500,
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 1500,
        property_type: 'house',
        furnished: 'furnished',
        amenities: ['WiFi', 'Pool', 'Gym'],
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    propertyId = res.data.id;
    log('POST /properties', true, res.data);
  } catch (e) {
    log('POST /properties', false, e.response?.data);
  }

  await sleep(500);

  // Test 11: Get Property by ID
  if (propertyId) {
    try {
      const res = await client.get(`/properties/${propertyId}`);
      log('GET /properties/:id', true, { title: res.data.title });
    } catch (e) {
      log('GET /properties/:id', false, e.response?.data);
    }
  }

  await sleep(500);

  // Test 12: Update Property (admin)
  if (propertyId) {
    try {
      const res = await client.put(
        `/properties/${propertyId}`,
        { title: 'Updated Test Property', monthly_price: 3000 },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('PUT /properties/:id', true, res.data);
    } catch (e) {
      log('PUT /properties/:id', false, e.response?.data);
    }
  }

  await sleep(500);

  // Test 13: Get Properties with filters
  try {
    const res = await client.get('/properties?location=Test City&minPrice=2000&maxPrice=4000');
    log('GET /properties (with filters)', true, { count: res.data.properties?.length });
  } catch (e) {
    log('GET /properties (with filters)', false, e.response?.data);
  }

  console.log('\n');

  // ==================== BOOKINGS TESTS ====================
  console.log('📅 BOOKINGS ENDPOINTS');
  console.log('='.repeat(50));

  // Test 14: Create Booking (user)
  if (propertyId && userToken) {
    try {
      const moveIn = new Date();
      const moveOut = new Date();
      moveOut.setMonth(moveOut.getMonth() + 3);

      const res = await client.post(
        '/bookings',
        {
          property_id: propertyId,
          move_in_date: moveIn.toISOString().split('T')[0],
          move_out_date: moveOut.toISOString().split('T')[0],
          months: 3,
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      bookingId = res.data.id;
      log('POST /bookings', true, res.data);
    } catch (e) {
      log('POST /bookings', false, e.response?.data);
    }
  }

  await sleep(500);

  // Test 15: Get My Bookings
  if (userToken) {
    try {
      const res = await client.get('/bookings/my', {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      log('GET /bookings/my', true, { count: res.data.length });
    } catch (e) {
      log('GET /bookings/my', false, e.response?.data);
    }
  }

  await sleep(500);

  // Test 16: Get Booking by ID
  if (bookingId && userToken) {
    try {
      const res = await client.get(`/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      paymentId = res.data.payment?.id;
      log('GET /bookings/:id', true, { id: res.data.id, status: res.data.booking_status });
    } catch (e) {
      log('GET /bookings/:id', false, e.response?.data);
    }
  }

  await sleep(500);

  // Test 17: Get All Bookings (admin)
  if (adminToken) {
    try {
      const res = await client.get('/bookings', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      log('GET /bookings (admin)', true, { count: res.data.length });
    } catch (e) {
      log('GET /bookings (admin)', false, e.response?.data);
    }
  }

  await sleep(500);

  // Test 18: Update Booking Status (admin)
  if (bookingId && adminToken) {
    try {
      const res = await client.put(
        `/bookings/${bookingId}/status`,
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('PUT /bookings/:id/status', true, res.data);
    } catch (e) {
      log('PUT /bookings/:id/status', false, e.response?.data);
    }
  }

  console.log('\n');

  // ==================== PAYMENTS TESTS ====================
  console.log('💳 PAYMENTS ENDPOINTS');
  console.log('='.repeat(50));

  // Test 19: Upload Payment Screenshot
  if (bookingId && userToken) {
    try {
      // Create a dummy file for testing
      const testFilePath = path.join(process.cwd(), 'test-screenshot.txt');
      fs.writeFileSync(testFilePath, 'fake image data');

      const form = new FormData();
      form.append('screenshot', fs.createReadStream(testFilePath));

      const res = await axios.post(
        `${API}/payments/${bookingId}/screenshot`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${userToken}`,
            Cookie: `token=${userToken}`,
          },
          withCredentials: true,
        }
      );
      log('POST /payments/:booking_id/screenshot', true, res.data);
    } catch (e) {
      log('POST /payments/:booking_id/screenshot', false, e.response?.data || e.message);
    }
  }

  await sleep(500);

  // Test 20: Verify Payment (admin)
  if (paymentId && adminToken) {
    try {
      const res = await client.put(
        `/payments/${paymentId}/verify`,
        { status: 'verified', admin_notes: 'Payment verified' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('PUT /payments/:id/verify', true, res.data);
    } catch (e) {
      log('PUT /payments/:id/verify', false, e.response?.data);
    }
  }

  console.log('\n');

  // ==================== USERS TESTS ====================
  console.log('👥 USERS ENDPOINTS');
  console.log('='.repeat(50));

  // Test 21: Get All Users (admin)
  if (adminToken) {
    try {
      const res = await client.get('/users', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      log('GET /users', true, { count: res.data.length });
    } catch (e) {
      log('GET /users', false, e.response?.data);
    }
  }

  await sleep(500);

  // Test 22: Update User Role (admin)
  if (userId && adminToken) {
    try {
      const res = await client.put(
        `/users/${userId}`,
        { role: 'admin' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log('PUT /users/:id', true, res.data);
    } catch (e) {
      log('PUT /users/:id', false, e.response?.data);
    }
  }

  console.log('\n');

  // ==================== REVIEWS TESTS ====================
  console.log('⭐ REVIEWS ENDPOINTS');
  console.log('='.repeat(50));

  // Test 23: Get Property Reviews
  if (propertyId) {
    try {
      const res = await client.get(`/reviews/property/${propertyId}`);
      log('GET /reviews/property/:propertyId', true, { count: res.data.length });
    } catch (e) {
      log('GET /reviews/property/:propertyId', false, e.response?.data);
    }
  }

  await sleep(500);

  // Test 24: Create Review
  if (propertyId && userToken) {
    try {
      const res = await client.post(
        '/reviews',
        {
          property_id: propertyId,
          rating: 5,
          comment: 'Great property! Test review.',
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      log('POST /reviews', true, res.data);
    } catch (e) {
      log('POST /reviews', false, e.response?.data);
    }
  }

  console.log('\n');

  // ==================== CLEANUP ====================
  console.log('🧹 CLEANUP');
  console.log('='.repeat(50));

  // Delete test property (admin)
  if (propertyId && adminToken) {
    try {
      const res = await client.delete(`/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      log('DELETE /properties/:id', true, res.data);
    } catch (e) {
      log('DELETE /properties/:id', false, e.response?.data);
    }
  }

  console.log('\n');
  console.log('='.repeat(50));
  console.log('✅ ALL API TESTS COMPLETED!');
  console.log('='.repeat(50));
};

runTests().catch(console.error);
