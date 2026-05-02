import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

const createTables = async () => {
  console.log('🔧 Creating database tables...');

  // Users Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      role VARCHAR(50) DEFAULT 'user',
      is_verified BOOLEAN DEFAULT FALSE,
      reset_token VARCHAR(255),
      reset_expires DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      slug VARCHAR(255),
      description TEXT,
      icon VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Properties Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS properties (
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
      status VARCHAR(50) DEFAULT 'active',
      featured BOOLEAN DEFAULT FALSE,
      category_id INT,
      amenities JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Property Images Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS property_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id INT NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      is_primary BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    )
  `);

  // Bookings Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
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

  // Payments Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
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

  // Payment Methods Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payment_methods (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      instructions TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Property Payment Methods (Junction Table)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS property_payment_methods (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id INT NOT NULL,
      payment_method_id INT NOT NULL,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE CASCADE
    )
  `);

  // Reviews Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
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

  // Settings Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
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

  console.log('✅ Database tables created successfully!');
};

const seedAdmin = async () => {
  console.log('👤 Setting up Admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Admin
  await pool.query(
    `INSERT INTO users (name, email, password, role, is_verified) 
     VALUES ('Admin User', 'amitxrajwar@gmail.com', ?, 'admin', TRUE)
     ON DUPLICATE KEY UPDATE password = VALUES(password)`,
    [adminPassword]
  );
  console.log('✅ Admin User: amitxrajwar@gmail.com / admin123');

  // Test User
  await pool.query(
    `INSERT INTO users (name, email, password, role, is_verified) VALUES 
     ('Test User', 'user@premiumstays.com', ?, 'user', TRUE)
     ON DUPLICATE KEY UPDATE password = VALUES(password)`,
    [userPassword]
  );
  console.log('✅ Test User: user@premiumstays.com / user123');
};

const seedSampleData = async () => {
  console.log('📦 Inserting sample properties...');
  const [count] = await pool.query('SELECT COUNT(*) as count FROM properties');
  if (count[0].count > 0) {
    console.log('⏭️ Properties already exist, skipping...');
    return;
  }

  const properties = [
    {
      title: 'Luxury Downtown Apartment',
      description: 'Modern apartment with city views.',
      location: 'New York, NY',
      monthly_price: 3500,
      bedrooms: 2, bathrooms: 2, square_feet: 1200,
      property_type: 'apartment', furnished: 'furnished', featured: true,
      amenities: JSON.stringify(['WiFi', 'Gym', 'Pool']),
    }
  ];

  for (const prop of properties) {
    await pool.query(
      `INSERT INTO properties (title, description, location, monthly_price, bedrooms, bathrooms, square_feet, property_type, furnished, featured, amenities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [prop.title, prop.description, prop.location, prop.monthly_price, prop.bedrooms, prop.bathrooms, prop.square_feet, prop.property_type, prop.furnished, prop.featured, prop.amenities]
    );
  }
  console.log('✅ Sample properties added');
};

const runSeed = async () => {
  try {
    console.log('\n🌱 Starting Automated Database Setup...\n');
    
    await createTables();
    await seedAdmin();
    await seedSampleData();
    
    console.log('\n🎉 Database setup completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

runSeed();
