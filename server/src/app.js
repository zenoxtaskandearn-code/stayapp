import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import reviewRoutes from './routes/reviews.js';
import settingsRoutes from './routes/settings.js';
import userRoutes from './routes/users.js';
import categoryRoutes from './routes/categories.js';
import uploadRoutes from './routes/upload.js';
import paymentMethodRoutes from './routes/paymentMethods.js';
import { pool } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 🔧 AUTO DATABASE SCHEMA SYNC
// Runs on startup to ensure all columns exist
// ==========================================
const syncDatabase = async () => {
  try {
    console.log('🔧 Checking database schema...');
    
    // Users Table Updates
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER email`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) AFTER is_verified`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires DATETIME AFTER reset_token`);

    // Properties Table Updates
    await pool.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS map_link TEXT AFTER location`);
    await pool.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS deposit DECIMAL(10,2) DEFAULT 0 AFTER monthly_price`);

    // Bookings Table Updates
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD' AFTER total_amount`);

    // Payments Table Updates
    await pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS screenshot VARCHAR(255) AFTER status`);
    await pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS admin_notes TEXT AFTER screenshot`);

    console.log('✅ Database schema is up to date!');
  } catch (error) {
    console.log('⚠️  Schema sync note:', error.message);
  }
};

// Run sync before starting server
syncDatabase();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static('src/uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Rental Property API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
