import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rental_property',
  port: process.env.DB_PORT || 3306,
});

app.get('/api/init', async (req, res) => {
  try {
    console.log('Adding columns...');
    
    await pool.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS payment_method_id INT DEFAULT NULL`);
    await pool.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS cancellation_policy TEXT`);
    
    // Create payment_methods table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        instructions TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    res.json({ message: 'Done - columns added' });
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ message: 'Error', error: error.message });
  }
});

app.listen(5555, () => {
  console.log('Init server running on port 5555');
});