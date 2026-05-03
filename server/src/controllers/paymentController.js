import { pool } from '../config/db.js';
import multer from 'multer';
import cloudinary from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

export const uploadMiddleware = upload.single('screenshot');

export const uploadPaymentScreenshot = async (req, res) => {
  try {
    const { booking_id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert to base64 and upload to Cloudinary
    const b64 = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'rental_property/payments',
    });

    const screenshotUrl = result.secure_url;

    await pool.query(
      'UPDATE payments SET screenshot = ?, status = "pending" WHERE booking_id = ?',
      [screenshotUrl, booking_id]
    );

    res.json({ message: 'Payment screenshot uploaded', screenshot: screenshotUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    await pool.query(
      'UPDATE payments SET status = ?, admin_notes = ? WHERE id = ?',
      [status, admin_notes, id]
    );

    if (status === 'verified') {
      // Get booking and property info first
      const [bookings] = await pool.query(
        `SELECT b.property_id, b.move_in_date, b.months FROM bookings b 
         JOIN payments p ON p.booking_id = b.id WHERE p.id = ?`,
        [id]
      );
      
      if (bookings.length > 0) {
        await pool.query(
          'UPDATE bookings SET payment_status = "verified", booking_status = "approved" WHERE id = (SELECT booking_id FROM payments WHERE id = ?)',
          [id]
        );
        
        // Mark property as booked with unavailable dates
        await pool.query(
          `UPDATE properties SET status = 'booked', unavailable_dates = ? WHERE id = ?`,
          [JSON.stringify({ booking_id: bookings[0].booking_id, move_in: bookings[0].move_in_date, months: bookings[0].months }), bookings[0].property_id]
        );
      }
    }

    res.json({ message: 'Payment verification updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const [payments] = await pool.query(
      `SELECT p.*, b.move_in_date, b.move_out_date, b.total_amount, b.booking_status, u.name as user_name, u.email as user_email
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN users u ON b.user_id = u.id
       ORDER BY p.created_at DESC`
    );
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};