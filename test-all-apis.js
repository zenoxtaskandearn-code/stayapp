const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API = 'http://localhost:5000/api';
const client = axios.create({
  baseURL: API,
  withCredentials: true,
  maxRedirects: 0,
  validateStatus: () => true,
});

let adminToken = '';
let userToken = '';
let adminId = '';
let userId = '';
let propertyId = '';
let bookingId = '';
let paymentId = '';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const test = async (name, fn) => {
  try {
    const start = Date.now();
    const result = await fn();
    const time = Date.now() - start;
    console.log(`✅ ${name.padEnd(50)} ${time}ms`);
    return result;
  } catch (e) {
    const status = e.response?.status || 'ERR';
    const msg = JSON.stringify(e.response?.data || e.message).slice(0, 80);
    console.log(`❌ ${name.padEnd(50)} ${status} ${msg}`);
    return null;
  }
};

const runAllTests = async () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 COMPREHENSIVE API TEST SUITE - ALL ENDPOINTS');
  console.log('='.repeat(70) + '\n');

  // ============================================
  // 1. HEALTH CHECK
  // ============================================
  console.log('📊 1. HEALTH CHECK');
  console.log('-'.repeat(70));
  await test('GET /api/health', () => client.get('/health'));
  console.log('');

  // ============================================
  // 2. AUTH ENDPOINTS
  // ============================================
  console.log('🔐 2. AUTHENTICATION ENDPOINTS');
  console.log('-'.repeat(70));

  const uniqueAdmin = `admin${Date.now()}@test.com`;
  const uniqueUser = `user${Date.now()}@test.com`;

  await test('POST /auth/register (new admin)', async () => {
    const r = await client.post('/auth/register', {
      name: 'Test Admin',
      email: uniqueAdmin,
      password: 'admin123',
      phone: '+1234567890',
    });
    adminToken = r.data.token;
    adminId = r.data.user.id;
    return r.data;
  });

  await sleep(200);

  await test('POST /auth/register (new user)', async () => {
    const r = await client.post('/auth/register', {
      name: 'Test User',
      email: uniqueUser,
      password: 'user123',
      phone: '+0987654321',
    });
    userToken = r.data.token;
    userId = r.data.user.id;
    return r.data;
  });

  await sleep(200);

  await test('POST /auth/login (admin)', async () => {
    const r = await client.post('/auth/login', {
      email: 'admin@premiumstays.com',
      password: 'admin123',
    });
    adminToken = r.data.token;
    return r.data;
  });

  await sleep(200);

  await test('POST /auth/login (user)', async () => {
    const r = await client.post('/auth/login', {
      email: uniqueUser,
      password: 'user123',
    });
    userToken = r.data.token;
    userId = r.data.user.id;
    return r.data;
  });

  await sleep(200);

  await test('GET /auth/me (authenticated)', () => {
    return client.get('/auth/me', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
  });

  await sleep(200);

  await test('GET /auth/me (unauthorized - no token)', () => {
    return client.get('/auth/me');
  });

  await sleep(200);

  await test('POST /auth/logout', () => {
    return client.post('/auth/logout');
  });

  console.log('');

  // ============================================
  // 3. SETTINGS ENDPOINTS
  // ============================================
  console.log('⚙️ 3. SETTINGS ENDPOINTS');
  console.log('-'.repeat(70));

  await test('GET /settings (public)', () => client.get('/settings'));

  await sleep(200);

  await test('PUT /settings (admin)', () => {
    return client.put(
      '/settings',
      {
        website_name: 'Test Premium Stays',
        theme_color: '#ff0000',
        footer_text: 'Test Footer Text',
        contact_email: 'test@example.com',
        contact_phone: '+1234567890',
        payment_instructions: 'Test payment instructions here.',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
  });

  await sleep(200);

  await test('PUT /settings (unauthorized - user)', () => {
    return client.put(
      '/settings',
      { website_name: 'Hacked' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
  });

  await sleep(200);

  await test('GET /settings (verify update)', () => client.get('/settings'));

  console.log('');

  // ============================================
  // 4. PROPERTY ENDPOINTS
  // ============================================
  console.log('🏠 4. PROPERTY ENDPOINTS');
  console.log('-'.repeat(70));

  await test('GET /properties (list all)', () => client.get('/properties'));

  await sleep(200);

  await test('GET /properties/featured', () => client.get('/properties/featured'));

  await sleep(200);

  await test('POST /properties (create by admin)', async () => {
    const r = await client.post(
      '/properties',
      {
        title: 'Test Luxury Apartment',
        description: 'A beautiful test property with amazing amenities.',
        location: 'Test City, TC',
        monthly_price: 3000,
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 1500,
        property_type: 'apartment',
        furnished: 'furnished',
        featured: true,
        amenities: ['WiFi', 'Pool', 'Gym', 'Parking'],
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    propertyId = r.data.id;
    return r.data;
  });

  await sleep(200);

  await test('POST /properties (unauthorized - user)', () => {
    return client.post(
      '/properties',
      { title: 'Hacked Property' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
  });

  await sleep(200);

  if (propertyId) {
    await test('GET /properties/:id (get by id)', () =>
      client.get(`/properties/${propertyId}`));

    await sleep(200);

    await test('PUT /properties/:id (update)', () => {
      return client.put(
        `/properties/${propertyId}`,
        { title: 'Updated Test Property', monthly_price: 3500 },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
    });

    await sleep(200);

    await test('GET /properties with filters', () =>
      client.get('/properties?location=Test City&minPrice=2000&maxPrice=4000'));

    await sleep(200);

    await test('GET /properties (verify update)', () =>
      client.get(`/properties/${propertyId}`));
  }

  console.log('');

  // ============================================
  // 5. BOOKING ENDPOINTS
  // ============================================
  console.log('📅 5. BOOKING ENDPOINTS');
  console.log('-'.repeat(70));

  if (propertyId && userToken) {
    const moveIn = '2026-06-01';
    const moveOut = '2026-09-01';

    await test('POST /bookings (create booking)', async () => {
      const r = await client.post(
        '/bookings',
        {
          property_id: propertyId,
          move_in_date: moveIn,
          move_out_date: moveOut,
          months: 3,
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      bookingId = r.data.id;
      return r.data;
    });

    await sleep(200);

    await test('POST /bookings (unauthorized - no token)', () => {
      return client.post('/bookings', {
        property_id: propertyId,
        move_in_date: moveIn,
        move_out_date: moveOut,
        months: 1,
      });
    });

    await sleep(200);

    await test('GET /bookings/my (user bookings)', () => {
      return client.get('/bookings/my', {
        headers: { Authorization: `Bearer ${userToken}` },
      });
    });

    await sleep(200);

    if (bookingId) {
      await test('GET /bookings/:id (booking details)', () => {
        return client.get(`/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
      });

      await sleep(200);

      // Store payment ID from booking details
      try {
        const bookingRes = await client.get(`/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        paymentId = bookingRes.data.payment?.id;
      } catch (e) {}
    }

    await test('GET /bookings (admin - all bookings)', () => {
      return client.get('/bookings', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    });

    await sleep(200);

    await test('GET /bookings (unauthorized - user)', () => {
      return client.get('/bookings', {
        headers: { Authorization: `Bearer ${userToken}` },
      });
    });

    await sleep(200);

    if (bookingId) {
      await test('PUT /bookings/:id/status (approve)', () => {
        return client.put(
          `/bookings/${bookingId}/status`,
          { status: 'approved' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
      });

      await sleep(200);

      await test('PUT /bookings/:id/status (reject)', () => {
        return client.put(
          `/bookings/${bookingId}/status`,
          { status: 'rejected' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
      });

      await sleep(200);

      await test('PUT /bookings/:id/status (unauthorized - user)', () => {
        return client.put(
          `/bookings/${bookingId}/status`,
          { status: 'approved' },
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
      });
    }
  }

  console.log('');

  // ============================================
  // 6. PAYMENT ENDPOINTS
  // ============================================
  console.log('💳 6. PAYMENT ENDPOINTS');
  console.log('-'.repeat(70));

  if (bookingId && userToken) {
    await test('POST /payments/:id/screenshot (upload)', async () => {
      const form = new FormData();
      form.append('screenshot', Buffer.from('fake-image-data'), 'test.png');
      return await client.post(`/payments/${bookingId}/screenshot`, form, {
        headers: { ...form.getHeaders(), Authorization: `Bearer ${userToken}` },
      });
    });

    await sleep(200);

    if (paymentId) {
      await test('PUT /payments/:id/verify (admin verify)', () => {
        return client.put(
          `/payments/${paymentId}/verify`,
          { status: 'verified', admin_notes: 'Payment verified' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
      });

      await sleep(200);

      await test('PUT /payments/:id/verify (unauthorized - user)', () => {
        return client.put(
          `/payments/${paymentId}/verify`,
          { status: 'verified' },
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
      });
    }
  }

  console.log('');

  // ============================================
  // 7. USER ENDPOINTS
  // ============================================
  console.log('👥 7. USER MANAGEMENT ENDPOINTS');
  console.log('-'.repeat(70));

  await test('GET /users (admin)', () => {
    return client.get('/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  });

  await sleep(200);

  await test('GET /users (unauthorized - user)', () => {
    return client.get('/users', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
  });

  await sleep(200);

  if (userId) {
    await test('PUT /users/:id (make admin)', () => {
      return client.put(
        `/users/${userId}`,
        { role: 'admin' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
    });

    await sleep(200);

    await test('PUT /users/:id (make user again)', () => {
      return client.put(
        `/users/${userId}`,
        { role: 'user' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
    });
  }

  console.log('');

  // ============================================
  // 8. REVIEW ENDPOINTS
  // ============================================
  console.log('⭐ 8. REVIEW ENDPOINTS');
  console.log('-'.repeat(70));

  if (propertyId) {
    await test('GET /reviews/property/:id (get reviews)', () =>
      client.get(`/reviews/property/${propertyId}`));

    await sleep(200);

    await test('POST /reviews (create review)', () => {
      return client.post(
        '/reviews',
        {
          property_id: propertyId,
          rating: 5,
          comment: 'Excellent property! Test review.',
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
    });

    await sleep(200);

    await test('POST /reviews (invalid - no rating)', () => {
      return client.post(
        '/reviews',
        { property_id: propertyId, comment: 'Bad review' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
    });
  }

  console.log('');

  // ============================================
  // 9. CLEANUP
  // ============================================
  console.log('🧹 9. CLEANUP - DELETE TEST DATA');
  console.log('-'.repeat(70));

  if (propertyId) {
    await test('DELETE /properties/:id (cleanup)', () => {
      return client.delete(`/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ ALL API TESTS COMPLETED!');
  console.log('='.repeat(70) + '\n');
};

runAllTests().catch(console.error);
