# Rental Property Platform - VPS Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ server running
- PM2 process manager (optional, for production)

## Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE rental_property;
```

2. Create a database user with privileges:
```sql
CREATE USER 'rental_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON rental_property.* TO 'rental_user'@'localhost';
FLUSH PRIVILEGES;
```

## Environment Configuration

Create a `.env` file in the server directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=rental_user
DB_PASSWORD=your_password
DB_NAME=rental_property
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (for booking confirmations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Deployment Steps

1. **Clone and setup:**
```bash
git clone <your-repo-url>
cd rental-property/server
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. **Run deployment script:**
```bash
npm run deploy
```

This will:
- ✅ Check database connection
- ✅ Install dependencies
- ✅ Create all database tables automatically
- ✅ Seed initial data (admin user, categories, etc.)

4. **Start the server:**
```bash
# Development
npm run dev

# Production (recommended)
npm install -g pm2
pm2 start src/app.js --name "rental-property"
pm2 startup
pm2 save
```

## Client Deployment

1. **Build the client:**
```bash
cd ../client
npm install
npm run build
```

2. **Serve static files:**
The built files in `client/dist` can be served by your web server (nginx/apache) or uploaded to a CDN.

## Admin Access

After deployment, you can access the admin panel at:
- **URL:** `http://your-vps-ip/admin`
- **Email:** `admin@premiumstays.com`
- **Password:** `admin123`

## Automatic Schema Management

The application includes automatic database schema management:

- **On startup:** The app automatically creates missing tables and columns
- **Safe updates:** Existing data is preserved during schema updates
- **No manual SQL:** No need to run SQL files manually

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running: `sudo systemctl status mysql`
- Check credentials in `.env` file
- Verify user has proper permissions

### Port Issues
- Default port is 5000, ensure it's not blocked by firewall
- Change PORT in `.env` if needed

### Permission Issues
- Ensure the application has write permissions for uploads folder
- Check file permissions: `chmod 755 uploads/`

## Security Notes

- Change the default admin password after first login
- Use strong JWT_SECRET and database passwords
- Configure firewall to only allow necessary ports
- Use HTTPS in production (nginx reverse proxy recommended)
- Regularly update dependencies: `npm audit fix`