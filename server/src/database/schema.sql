-- Rental Property Platform Database Schema

CREATE DATABASE IF NOT EXISTS rental_property;
USE rental_property;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  phone VARCHAR(20),
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  address TEXT,
  monthly_price DECIMAL(10,2) NOT NULL,
  bedrooms INT DEFAULT 1,
  bathrooms INT DEFAULT 1,
  square_feet INT,
  category_id INT,
  property_type ENUM('apartment', 'house', 'villa', 'studio', 'condo') DEFAULT 'apartment',
  furnished ENUM('furnished', 'semi-furnished', 'unfurnished') DEFAULT 'unfurnished',
  status ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
  featured BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  amenities JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Property images table
CREATE TABLE IF NOT EXISTS property_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  property_id INT NOT NULL,
  move_in_date DATE NOT NULL,
  move_out_date DATE NOT NULL,
  months INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  booking_status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  screenshot VARCHAR(500),
  status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  property_id INT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  website_name VARCHAR(100) DEFAULT 'Premium Stays',
  logo VARCHAR(500),
  theme_color VARCHAR(20) DEFAULT '#ef4444',
  footer_text VARCHAR(255),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  payment_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (website_name, theme_color, footer_text, contact_email, contact_phone, payment_instructions)
VALUES (
  'Premium Stays',
  '#ef4444',
  '© 2026 Premium Stays. All rights reserved.',
  'contact@premiumstays.com',
  '+1-234-567-8900',
  'Please transfer the amount to the following bank account:\n\nBank: Example Bank\nAccount Name: Premium Stays LLC\nAccount Number: 1234567890\nRouting Number: 987654321\n\nOr use Remitly/Wise to send payment to: payments@premiumstays.com\n\nAfter payment, upload the screenshot for verification.'
) ON DUPLICATE KEY UPDATE id=id;

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@premiumstays.com', '$2b$10$YourHashedPasswordHere', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, slug, description, icon) VALUES
('Apartment', 'apartment', 'Modern apartments with all amenities', 'building'),
('House', 'house', 'Independent houses and villas', 'home'),
('Condo', 'condo', 'Premium condominiums', 'apartment'),
('Studio', 'studio', 'Compact studio apartments', 'box'),
('Villa', 'villa', 'Luxury villas with gardens', 'tree')
ON DUPLICATE KEY UPDATE id=id;
