import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { generateOTP, sendOTPEmail, sendResetLink, sendBookingConfirmation } from '../services/emailService.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (phone && !/^[\d\s\-+()]+$/.test(phone)) {
      return res.status(400).json({ message: 'Please enter a valid phone number' });
    }

    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate OTP and store temporarily
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with OTP (not verified yet)
    await pool.query(
      'INSERT INTO users (name, email, password, phone, verification_otp, otp_expires, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, otp, otpExpiry, false]
    );

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, 'verification');
    } catch (e) {
      console.log('Email not sent (configure SMTP):', e.message);
    }

    res.status(201).json({ 
      message: 'Registration successful! Please check your email for verification code.',
      needsVerification: true,
      userId: 0 // Will be returned after verification
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND verification_otp = ?',
      [email, otp]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const user = users[0];
    
    // Check OTP expiry
    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // Update user as verified
    await pool.query(
      'UPDATE users SET verification_otp = NULL, otp_expires = NULL, is_verified = true WHERE id = ?',
      [user.id]
    );

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Please enter your password' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if verified (skip for admin)
    if (!user.is_verified && user.role !== 'admin') {
      // Generate new OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      
      await pool.query(
        'UPDATE users SET verification_otp = ?, otp_expires = ? WHERE id = ?',
        [otp, otpExpiry, user.id]
      );

      try {
        await sendOTPEmail(email, otp, 'verification');
      } catch (e) {
        console.log('Email not sent (configure SMTP):', e.message);
      }

      return res.status(403).json({ 
        message: 'Please verify your email first',
        needsVerification: true,
        email 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, phone, is_verified, created_at FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      'UPDATE users SET verification_otp = ?, otp_expires = ? WHERE email = ?',
      [otp, otpExpiry, email]
    );

    try {
      await sendOTPEmail(email, otp, 'verification');
    } catch (e) {
      console.log('Email not sent:', e.message);
    }

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: users[0].id, type: 'reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?',
      [resetToken, resetExpiry, email]
    );

    try {
      await sendResetLink(email, resetToken);
    } catch (e) {
      console.log('Email not sent:', e.message);
    }

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND reset_token = ?',
      [decoded.id, token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [hashedPassword, decoded.id]
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};