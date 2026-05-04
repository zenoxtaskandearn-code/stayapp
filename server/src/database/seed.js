import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const ensureTables = async () => {
  console.log('🔧 Checking and creating tables if missing...');

  const tableExists = async (tableName) => {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [tableName]
    );
    return rows[0].count > 0;
  };

  const addColumnIfMissing = async (table, column, definition) => {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    if (rows[0].count === 0) {
      await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`   ✓ Added ${column} to ${table}`);
    }
  };

  if (!(await tableExists('users'))) {
    await pool.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_otp VARCHAR(10),
        otp_expires DATETIME,
        reset_token VARCHAR(255),
        reset_expires DATETIME,
        avatar VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Created users table');
  } else {
    await addColumnIfMissing('users', 'phone', 'VARCHAR(20) AFTER email');
    await addColumnIfMissing('users', 'verification_otp', 'VARCHAR(10) AFTER is_verified');
    await addColumnIfMissing('users', 'otp_expires', 'DATETIME AFTER verification_otp');
    await addColumnIfMissing('users', 'reset_token', 'VARCHAR(255) AFTER otp_expires');
    await addColumnIfMissing('users', 'reset_expires', 'DATETIME AFTER reset_token');
    await addColumnIfMissing('users', 'avatar', 'VARCHAR(255) DEFAULT NULL AFTER reset_expires');
  }

  if (!(await tableExists('categories'))) {
    await pool.query(`
      CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255),
        description TEXT,
        icon VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Created categories table');
  }

  if (!(await tableExists('properties'))) {
    await pool.query(`
      CREATE TABLE properties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        map_link TEXT,
        monthly_price DECIMAL(10,2) DEFAULT 0,
        deposit DECIMAL(10,2) DEFAULT 0,
        bedrooms INT DEFAULT 0,
        bathrooms INT DEFAULT 0,
        square_feet INT DEFAULT 0,
        property_type VARCHAR(50),
        furnished VARCHAR(50),
        status VARCHAR(50) DEFAULT 'available',
        featured BOOLEAN DEFAULT FALSE,
        category_id INT,
        currency VARCHAR(3) DEFAULT 'USD',
        amenities JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Created properties table');
  } else {
    await addColumnIfMissing('properties', 'map_link', 'TEXT AFTER location');
    await addColumnIfMissing('properties', 'deposit', 'DECIMAL(10,2) DEFAULT 0 AFTER monthly_price');
    await addColumnIfMissing('properties', 'category_id', 'INT AFTER featured');
    await addColumnIfMissing('properties', 'currency', "VARCHAR(3) DEFAULT 'USD' AFTER category_id");
    await addColumnIfMissing('properties', 'amenities', 'JSON AFTER currency');
    await addColumnIfMissing('properties', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER amenities');
  }

  if (!(await tableExists('property_images'))) {
    await pool.query(`
      CREATE TABLE property_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )
    `);
    console.log('   ✓ Created property_images table');
  }

  if (!(await tableExists('bookings'))) {
    await pool.query(`
      CREATE TABLE bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        property_id INT NOT NULL,
        move_in_date DATE NOT NULL,
        move_out_date DATE,
        months INT DEFAULT 1,
        total_amount DECIMAL(10,2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'USD',
        booking_status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )
    `);
    console.log('   ✓ Created bookings table');
  } else {
    await addColumnIfMissing('bookings', 'currency', "VARCHAR(3) DEFAULT 'USD' AFTER total_amount");
  }

  if (!(await tableExists('payments'))) {
    await pool.query(`
      CREATE TABLE payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        amount DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        screenshot VARCHAR(255),
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `);
    console.log('   ✓ Created payments table');
  } else {
    await addColumnIfMissing('payments', 'screenshot', 'VARCHAR(255) AFTER status');
    await addColumnIfMissing('payments', 'admin_notes', 'TEXT AFTER screenshot');
  }

  if (!(await tableExists('payment_methods'))) {
    await pool.query(`
      CREATE TABLE payment_methods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        instructions TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Created payment_methods table');
  }

  if (!(await tableExists('property_payment_methods'))) {
    await pool.query(`
      CREATE TABLE property_payment_methods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id INT NOT NULL,
        payment_method_id INT NOT NULL,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE CASCADE
      )
    `);
    console.log('   ✓ Created property_payment_methods table');
  }

  if (!(await tableExists('reviews'))) {
    await pool.query(`
      CREATE TABLE reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        property_id INT NOT NULL,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )
    `);
    console.log('   ✓ Created reviews table');
  } else {
    await addColumnIfMissing('reviews', 'is_approved', 'BOOLEAN DEFAULT FALSE AFTER comment');
  }

  if (!(await tableExists('settings'))) {
    await pool.query(`
      CREATE TABLE settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        website_name VARCHAR(255),
        theme_color VARCHAR(255),
        footer_text TEXT,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        payment_instructions TEXT,
        bank_name VARCHAR(255),
        account_name VARCHAR(255),
        account_number VARCHAR(50),
        currency VARCHAR(3) DEFAULT 'USD'
      )
    `);
    console.log('   ✓ Created settings table');
  }

  console.log('✅ All tables verified!');
};

const seedData = async () => {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Always ensure admin has correct email
  console.log('\n👤 Setting up admin user...');
  
  try {
    // Delete ANY existing admin and create fresh
    await pool.query("DELETE FROM users WHERE role = 'admin'");
    
    // Create new admin with correct email
    await pool.query(
      `INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, 'admin', TRUE)`,
      ['Admin User', 'mijcocar191919@gmail.com', adminPassword]
    );
    console.log('✅ Admin ready: mijcocar191919@gmail.com / admin123');
  } catch (error) {
    console.log('⚠️ Admin setup error:', error.message);
  }
  }

  // Categories - only if empty
  const [catCheck] = await pool.query('SELECT id FROM categories LIMIT 1');
  if (catCheck.length === 0) {
    console.log('\n📂 Creating categories...');
    const categories = [
      ['Apartments', 'apartments', 'Apartment rentals', 'building', true],
      ['Houses', 'houses', 'House rentals', 'home', true],
      ['Villas', 'villas', 'Villa rentals', 'villa', true],
      ['Studios', 'studios', 'Studio rentals', 'studio', true],
      ['Condos', 'condos', 'Condo rentals', 'condo', true],
    ];
    for (const cat of categories) {
      await pool.query(
        'INSERT INTO categories (name, slug, description, icon, is_active) VALUES (?, ?, ?, ?, ?)',
        cat
      );
    }
    console.log(`✅ ${categories.length} categories added`);
  } else {
    console.log('\n📂 Categories already exist, skipping...');
  }

  // Properties - only if empty
  const [propCheck] = await pool.query('SELECT id FROM properties LIMIT 1');
  if (propCheck.length === 0) {
    console.log('\n🏠 Creating sample properties...');
    const properties = [
      {
        title: 'Luxury Downtown Apartment',
        description: 'Modern apartment with stunning city views and premium amenities.',
        location: 'New York, NY',
        map_link: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.5!2d-74.006!3d40.7128',
        monthly_price: 3500,
        deposit: 3500,
        bedrooms: 2,
        bathrooms: 2,
        square_feet: 1200,
        property_type: 'apartment',
        furnished: 'furnished',
      status: 'available',
      featured: true,
      category_id: 1,
      currency: 'USD',
      amenities: JSON.stringify(['WiFi', 'Gym', 'Pool', 'Parking', 'Laundry']),
    },
    {
      title: 'Cozy Beach House',
      description: 'Beautiful beach house with ocean views and private garden.',
      location: 'Miami, FL',
      map_link: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3560!2d-80.1918!3d25.7617',
      monthly_price: 2800,
      deposit: 2800,
      bedrooms: 3,
      bathrooms: 2,
      square_feet: 1800,
      property_type: 'house',
      furnished: 'semi-furnished',
      status: 'available',
        featured: true,
        category_id: 2,
        currency: 'USD',
        amenities: JSON.stringify(['WiFi', 'Garden', 'Beach Access', 'BBQ', 'Parking']),
      },
      {
        title: 'Modern Studio in City Center',
        description: 'Compact and stylish studio perfect for young professionals.',
        location: 'London, UK',
        map_link: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483!2d-0.1278!3d51.5074',
        monthly_price: 1500,
        deposit: 1500,
        bedrooms: 0,
        bathrooms: 1,
        square_feet: 450,
        property_type: 'studio',
        furnished: 'furnished',
      status: 'available',
      featured: false,
        category_id: 4,
        currency: 'GBP',
        amenities: JSON.stringify(['WiFi', 'Laundry', '24/7 Security']),
      },
    ];

    for (const prop of properties) {
      await pool.query(
        `INSERT INTO properties (title, description, location, map_link, monthly_price, deposit, bedrooms, bathrooms, square_feet, property_type, furnished, status, featured, category_id, currency, amenities)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [prop.title, prop.description, prop.location, prop.map_link, prop.monthly_price, prop.deposit, prop.bedrooms, prop.bathrooms, prop.square_feet, prop.property_type, prop.furnished, prop.status, prop.featured, prop.category_id, prop.currency, prop.amenities]
      );
    }
    console.log(`✅ ${properties.length} properties added`);
  } else {
    console.log('\n🏠 Properties already exist, skipping...');
  }

  // Payment Methods - only if empty
  const [pmCheck] = await pool.query('SELECT id FROM payment_methods LIMIT 1');
  if (pmCheck.length === 0) {
    console.log('\n💳 Creating payment methods...');
    const paymentMethods = [
      ['Bank Transfer', 'Direct bank transfer', 'Transfer to our bank account. Include your booking reference in the payment notes.\n\nBank: Chase Bank\nAccount: 1234567890\nName: Blueground LLC', true],
      ['Remitly', 'Send money via Remitly', 'Send your payment through Remitly using these steps:\n\n1. Download Remitly app or visit remitly.com\n2. Create an account or log in\n3. Select "Send Money"\n4. Enter the amount\n5. Choose your payment method\n6. Enter recipient details (provided after booking approval)\n7. Confirm and send\n8. Upload the receipt screenshot', true],
      ['PayPal', 'Pay via PayPal', 'Send payment to: payments@blueground.com\n\nInclude your booking ID in the notes section.', true],
      ['Wise', 'Transfer via Wise (TransferWise)', 'Send payment through Wise for lower fees.\n\nAccount details will be provided after booking approval.', true],
      ['Crypto', 'Pay with Cryptocurrency', 'We accept USDT (TRC-20) and BTC.\n\nWallet address will be provided after booking approval.', false],
    ];
    for (const pm of paymentMethods) {
      await pool.query(
        'INSERT INTO payment_methods (name, description, instructions, is_active) VALUES (?, ?, ?, ?)',
        pm
      );
    }
    console.log(`✅ ${paymentMethods.length} payment methods added`);
  } else {
    console.log('\n💳 Payment methods already exist, skipping...');
  }

  // Assign payment methods to properties (only for unassigned properties)
  const [assignedCheck] = await pool.query('SELECT id FROM property_payment_methods LIMIT 1');
  if (assignedCheck.length === 0) {
    console.log('\n📝 Assigning payment methods to properties...');
    const [props] = await pool.query('SELECT id FROM properties');
    const [pms] = await pool.query('SELECT id FROM payment_methods WHERE is_active = TRUE');
    for (const prop of props) {
      for (const pm of pms.slice(0, 3)) {
        await pool.query(
          'INSERT INTO property_payment_methods (property_id, payment_method_id) VALUES (?, ?)',
          [prop.id, pm.id]
        );
      }
    }
    console.log('✅ Payment methods assigned to properties');
  } else {
    console.log('\n📝 Payment method assignments already exist, skipping...');
  }

  // Settings - only if empty
  const [settingsCheck] = await pool.query('SELECT id FROM settings LIMIT 1');
  if (settingsCheck.length === 0) {
    console.log('\n⚙️ Creating default settings...');
    await pool.query(
      `INSERT INTO settings (website_name, theme_color, footer_text, contact_email, contact_phone, currency)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Blueground', '#1e40af', '© 2026 Blueground. All rights reserved.', 'info@estate-theblueground.co.uk', '+1-555-0123', 'USD']
    );
    console.log('✅ Settings created');
  } else {
    console.log('\n⚙️ Settings already exist, skipping...');
  }
};

const runSeed = async () => {
  try {
    console.log('\n🌱 Starting Database Setup (SAFE MODE - existing data preserved)...\n');
    
    await ensureTables();
    await seedData();
    
    console.log('\n🎉 Database setup completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

runSeed();
