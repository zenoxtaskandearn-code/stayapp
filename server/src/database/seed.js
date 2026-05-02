import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

const seed = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Hash password for admin and test user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Update admin user email
    await pool.query(
      `UPDATE users SET email = 'amitxrajwar@gmail.com', password = ?, role = 'admin', is_verified = true WHERE email = 'admin@premiumstays.com'`,
      [adminPassword]
    );

    // Insert test user
    await pool.query(
      `INSERT INTO users (name, email, password) VALUES
       ('John Doe', 'user@premiumstays.com', ?)
       ON DUPLICATE KEY UPDATE id=id`,
      [userPassword]
    );

    // Insert sample properties
    const properties = [
      {
        title: 'Luxury Downtown Apartment',
        description: 'Experience luxury living in the heart of downtown. This modern apartment features floor-to-ceiling windows, premium finishes, and stunning city views.',
        location: 'New York, NY',
        monthly_price: 3500,
        bedrooms: 2,
        bathrooms: 2,
        square_feet: 1200,
        property_type: 'apartment',
        furnished: 'furnished',
        featured: true,
        amenities: JSON.stringify(['WiFi', 'Gym', 'Pool', 'Parking', 'Doorman', 'A/C']),
      },
      {
        title: 'Modern Villa with Pool',
        description: 'Stunning modern villa with private pool, spacious rooms, and beautiful garden. Perfect for families looking for luxury.',
        location: 'Miami, FL',
        monthly_price: 5500,
        bedrooms: 4,
        bathrooms: 3,
        square_feet: 2800,
        property_type: 'villa',
        furnished: 'semi-furnished',
        featured: true,
        amenities: JSON.stringify(['WiFi', 'Pool', 'Garden', 'Parking', 'A/C', 'Security']),
      },
      {
        title: 'Cozy Studio in Arts District',
        description: 'Perfect studio apartment in the vibrant arts district. Close to galleries, cafes, and public transport.',
        location: 'Los Angeles, CA',
        monthly_price: 1800,
        bedrooms: 1,
        bathrooms: 1,
        square_feet: 600,
        property_type: 'studio',
        furnished: 'furnished',
        featured: true,
        amenities: JSON.stringify(['WiFi', 'Gym', 'Laundry', 'A/C']),
      },
      {
        title: 'Spacious Family House',
        description: 'Beautiful family house with large backyard, modern kitchen, and quiet neighborhood. Great schools nearby.',
        location: 'Austin, TX',
        monthly_price: 2800,
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 2000,
        property_type: 'house',
        furnished: 'unfurnished',
        featured: false,
        amenities: JSON.stringify(['Garden', 'Parking', 'Laundry', 'A/C', 'Garage']),
      },
      {
        title: 'High-Rise Condo with View',
        description: 'Luxury high-rise condo with breathtaking city views, modern amenities, and premium location.',
        location: 'Chicago, IL',
        monthly_price: 3200,
        bedrooms: 2,
        bathrooms: 2,
        square_feet: 1100,
        property_type: 'condo',
        furnished: 'furnished',
        featured: true,
        amenities: JSON.stringify(['WiFi', 'Gym', 'Pool', 'Concierge', 'A/C', 'Parking']),
      },
      {
        title: 'Charming Brownstone',
        description: 'Classic brownstone with modern updates, hardwood floors, and private patio. Located in prime neighborhood.',
        location: 'Brooklyn, NY',
        monthly_price: 3100,
        bedrooms: 2,
        bathrooms: 1,
        square_feet: 1050,
        property_type: 'house',
        furnished: 'semi-furnished',
        featured: false,
        amenities: JSON.stringify(['WiFi', 'Patio', 'Laundry', 'A/C']),
      },
    ];

    for (const prop of properties) {
      const [result] = await pool.query(
        `INSERT INTO properties
         (title, description, location, monthly_price, bedrooms, bathrooms, square_feet, property_type, furnished, featured, amenities)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prop.title,
          prop.description,
          prop.location,
          prop.monthly_price,
          prop.bedrooms,
          prop.bathrooms,
          prop.square_feet,
          prop.property_type,
          prop.furnished,
          prop.featured,
          prop.amenities,
        ]
      );

      // Insert sample images for each property
      const imageBase = 'https://images.unsplash.com/photo-';
      const imageIds = [
        '1600596542815-ffad4c1539a9',
        '1600582651290-8952cb4d4dee',
        '1600046084578-3e84d8b4a3c8',
        '1600566753371-794470a852c3',
        '1600576772-78d57a42aae8',
      ];

      for (let i = 0; i < 3; i++) {
        await pool.query(
          'INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)',
          [result.insertId, `${imageBase}${imageIds[i]}?w=800&q=80`, i === 0]
        );
      }
    }

    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('📧 Admin Login: amitxrajwar@gmail.com / admin123');
    console.log('📧 User Login: user@premiumstays.com / user123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
