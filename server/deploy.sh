#!/bin/bash

# Rental Property Platform - VPS Deployment Script
# This script ensures the database is properly initialized for production

echo "🚀 Starting Rental Property Platform Deployment Setup..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your database credentials:"
    echo "DB_HOST=localhost"
    echo "DB_USER=your_db_user"
    echo "DB_PASSWORD=your_db_password"
    echo "DB_NAME=rental_property"
    echo "DB_PORT=3306"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

echo "🔧 Checking database connection..."
node -e "
import mysql from 'mysql2/promise';
(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    console.log('✅ Database connection successful');
    await connection.end();
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    process.exit(1);
  }
})();
" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "❌ Database connection test failed"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️ Running database setup and seeding..."
npm run seed

echo "✅ Deployment setup complete!"
echo ""
echo "🎉 Your Rental Property Platform is ready!"
echo "Run 'npm start' to start the production server"
echo ""
echo "Admin Login:"
echo "Email: admin@premiumstays.com"
echo "Password: admin123"