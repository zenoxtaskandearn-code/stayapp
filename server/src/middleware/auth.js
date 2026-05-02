import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    console.log('Auth middleware - token present:', !!token);

    // If no token, continue without user but don't fail
    if (!token) {
      return next(); // Allow anon requests
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_2026_change_in_production');
    console.log('Decoded:', decoded);
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    console.log('Users found:', users.length);

    if (users.length) {
      req.user = users[0];
    }
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
    // Invalid token, continue anyway
    next();
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    const roleArray = roles[0] instanceof Array ? roles[0] : roles;
    if (!req.user || !roleArray.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
