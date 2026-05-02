# 🏠 Premium Stays - Property Rental Platform

A modern, premium property rental booking platform inspired by Airbnb/Booking.com style, built with React, Node.js, and MySQL.

## ✨ Features

### User Features
- 🔐 JWT Authentication (Login/Register)
- 🏠 Browse properties with filters (location, price, bedrooms, etc.)
- 🖼️ Property details with image gallery (Swiper)
- 📅 Booking system with date selection
- 💳 Manual payment system (bank transfer/Remitly/Wise)
- 📸 Upload payment screenshots
- 📋 My Bookings page with status tracking
- ❤️ Wishlist functionality
- 📱 Fully responsive (mobile-first)

### Admin Features
- 📊 Dashboard with analytics
- 🏠 Manage Properties (CRUD)
- 📅 Manage Bookings (approve/reject)
- 👥 Manage Users (role management)
- ⚙️ Settings (website name, colors, payment instructions)
- 🔒 Secure admin-only routes

## 🛠 Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- React Router DOM
- Axios
- Framer Motion (animations)
- React Hook Form
- Zustand (state management)
- SwiperJS (image slider)
- React Hot Toast

### Backend
- Node.js + Express.js
- MySQL (mysql2)
- JWT Authentication
- bcrypt (password hashing)
- Multer (file uploads)
- Helmet (security)
- Express Rate Limit

## 📋 Prerequisites

- Node.js (v18+)
- MySQL Server
- npm or yarn

## 🚀 Quick Setup

### 1. Clone & Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE rental_property;
exit;

# Run the schema
mysql -u root -p rental_property < src/database/schema.sql
```

### 3. Environment Configuration

Create `server/.env` file:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=rental_property
DB_PORT=3306

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

### 4. Seed Database (Optional)

```bash
cd server
npm run seed
```

This creates:
- Admin: `admin@premiumstays.com` / `admin123`
- User: `user@premiumstays.com` / `user123`
- 6 sample properties with images

### 5. Run the Application

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

Visit: http://localhost:5173

## 📁 Project Structure

```
rental-property/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API services
│   │   └── App.jsx
│   └── package.json
│
└── server/                 # Node.js backend
    ├── src/
    │   ├── config/         # Database config
    │   ├── controllers/    # Route controllers
    │   ├── routes/         # API routes
    │   ├── middleware/      # Auth middleware
    │   ├── database/       # Schema & seeds
    │   └── app.js
    └── package.json
```

## 🎨 Design Features

- ✅ Modern SaaS design with white minimal background
- ✅ Red primary color (#ef4444)
- ✅ Rounded corners (2xl)
- ✅ Premium soft shadows
- ✅ Smooth hover animations
- ✅ Large clean spacing
- ✅ Mobile-first responsive
- ✅ Glassmorphism touches
- ✅ Framer Motion animations
- ✅ Skeleton loaders

## 🔒 Security Features

- JWT Authentication
- Password hashing with bcrypt
- Protected routes
- Role-based access (admin/user)
- Helmet security headers
- Rate limiting
- XSS protection

## 📄 API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - List properties (with filters)
- `GET /api/properties/featured` - Featured properties
- `GET /api/properties/:id` - Property details
- `POST /api/properties` - Create property (admin)
- `PUT /api/properties/:id` - Update property (admin)
- `DELETE /api/properties/:id` - Delete property (admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - My bookings
- `GET /api/bookings/:id` - Booking details
- `GET /api/bookings` - All bookings (admin)
- `PUT /api/bookings/:id/status` - Update status (admin)

### Payments
- `POST /api/payments/:booking_id/screenshot` - Upload screenshot
- `PUT /api/payments/:id/verify` - Verify payment (admin)

## 🎯 Booking Flow

1. User browses properties
2. Views property details
3. Selects move-in date and duration
4. Confirms booking
5. Sees payment instructions
6. Uploads payment screenshot
7. Admin verifies payment
8. Booking approved

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚧 Future Enhancements

- [ ] Real-time chat
- [ ] Google Maps integration
- [ ] Advanced search with map view
- [ ] Wishlist functionality
- [ ] Email notifications
- [ ] Online payment gateway
- [ ] Multi-language support
- [ ] PWA support

## 📞 Support

For issues or questions, please contact: contact@premiumstays.com

---

Built with ❤️ in 2026
