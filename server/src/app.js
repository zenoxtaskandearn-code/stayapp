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
    
    const addColumnIfMissing = async (table, column, definition) => {
      const [rows] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
      );
      if (rows.length === 0) {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        console.log(`   ✓ Added ${column} to ${table}`);
      }
    };

    await addColumnIfMissing('users', 'phone', 'VARCHAR(20) AFTER email');
    await addColumnIfMissing('users', 'reset_token', 'VARCHAR(255) AFTER is_verified');
    await addColumnIfMissing('users', 'reset_expires', 'DATETIME AFTER reset_token');

    await addColumnIfMissing('properties', 'map_link', 'TEXT AFTER location');
    await addColumnIfMissing('properties', 'deposit', 'DECIMAL(10,2) DEFAULT 0 AFTER monthly_price');

    await addColumnIfMissing('bookings', 'currency', "VARCHAR(3) DEFAULT 'USD' AFTER total_amount");

    await addColumnIfMissing('payments', 'screenshot', 'VARCHAR(255) AFTER status');
    await addColumnIfMissing('payments', 'admin_notes', 'TEXT AFTER screenshot');

    console.log('✅ Database schema is up to date!');
  } catch (error) {
    console.error('⚠️  Schema sync error:', error.message);
  }
};

// Run sync before starting server
syncDatabase();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(helmet());
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    // Or localhost in development
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('https://')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Handle OPTIONS preflight for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(200);
  }
  next();
});

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
