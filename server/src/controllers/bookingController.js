import { pool } from '../config/db.js';
import moment from 'moment';
import { sendBookingConfirmation, sendBookingApproved, sendBookingRejected } from '../services/emailService.js';

export const createBooking = async (req, res) => {
  try {
    const { property_id, propertyId, move_in_date, move_out_date, months, user_id, currency } = req.body;
    const propId = property_id || propertyId;
    
    // Use user from auth or from body
    const userId = req.user?.id || user_id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User not found. Please login.' });
    }

    const [property] = await pool.query('SELECT * FROM properties WHERE id = ?', [propId]);
    if (!property.length) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Calculate move_out_date if not provided
    let finalMoveOutDate = move_out_date;
    const monthsInt = parseInt(months) || 1;
    if (!finalMoveOutDate && move_in_date && months) {
      const [y, m, d] = move_in_date.split('-').map(Number);
      const startDate = new Date(y, m - 1, d);
      startDate.setMonth(startDate.getMonth() + monthsInt);
      finalMoveOutDate = startDate.toISOString().split('T')[0];
    }

    const monthlyPrice = parseFloat(property[0].monthly_price) || 0;
    const depositAmount = parseFloat(property[0].deposit) || 0;
    const total_amount = (monthlyPrice * months) + depositAmount;

    const [result] = await pool.query(
      `INSERT INTO bookings (user_id, property_id, move_in_date, move_out_date, months, total_amount, currency)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, propId, move_in_date, finalMoveOutDate, months, total_amount, currency || property[0].currency || 'USD']
    );

    await pool.query('INSERT INTO payments (booking_id) VALUES (?)', [result.insertId]);

    const [booking] = await pool.query(
      `SELECT b.*, b.currency, p.title as property_title, p.location, p.bedrooms, p.bathrooms, p.square_feet, p.property_type, p.monthly_price, p.deposit as property_deposit, p.currency as property_currency
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE b.id = ?`,
      [result.insertId]
    );

    // Get user details, settings, and payment methods
    const [users] = await pool.query('SELECT email, name FROM users WHERE id = ?', [userId]);
    const [settings] = await pool.query('SELECT * FROM settings LIMIT 1');
    const [paymentMethods] = await pool.query(
      `SELECT pm.* 
       FROM payment_methods pm
       JOIN property_payment_methods ppm ON pm.id = ppm.payment_method_id
       WHERE ppm.property_id = ? AND pm.is_active = TRUE`,
      [propId]
    );
    
    if (users.length > 0) {
      try {
        await sendBookingConfirmation(users[0].email, booking[0], property[0], paymentMethods, settings[0] || {});
      } catch (e) {
        console.log('Confirmation email not sent:', e.message);
      }
    }

    res.status(201).json({ 
      message: 'Booking created successfully', 
      id: result.insertId,
      booking: booking[0]
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: error.message || 'Error creating booking' });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id || 1;
    const [bookings] = await pool.query(
      `SELECT b.*, p.title, p.location, p.monthly_price,
              GROUP_CONCAT(pi.image_url) as images
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       LEFT JOIN property_images pi ON p.id = pi.property_id
       WHERE b.user_id = ?
       GROUP BY b.id
       ORDER BY b.created_at DESC`,
      [userId]
    );

    const formatted = bookings.map((b) => ({
      ...b,
      images: b.images ? b.images.split(',') : [],
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const [bookings] = await pool.query(
      `SELECT b.*, 
              p.title, p.location, p.monthly_price, p.deposit as property_deposit, p.currency as property_currency, p.bedrooms, p.bathrooms, p.square_feet, p.property_type, p.amenities, p.id as property_id,
              u.name as user_name, u.email as user_email, u.phone as user_phone,
              (SELECT image_url FROM property_images WHERE property_id = p.id LIMIT 1) as property_image
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [id]
    );

    if (!bookings.length) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];
    booking.images = booking.property_image ? [booking.property_image] : [];
    
    const [payments] = await pool.query('SELECT * FROM payments WHERE booking_id = ?', [id]);
    booking.payment = payments[0] || null;

    // Get payment methods for this property
    const [paymentMethods] = await pool.query(
      `SELECT pm.* 
       FROM payment_methods pm
       JOIN property_payment_methods ppm ON pm.id = ppm.payment_method_id
       WHERE ppm.property_id = ? AND pm.is_active = TRUE`,
      [booking.property_id]
    );
    booking.payment_methods = paymentMethods || [];

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT b.id, b.user_id, b.property_id, b.move_in_date, b.move_out_date, b.months, b.total_amount, b.booking_status, b.payment_status, b.created_at, b.currency,
             p.title, p.location, 
             u.name as user_name, u.email, u.phone as user_phone,
             MAX(pg.screenshot) as payment_screenshot, MAX(pg.status) as payment_status,
             (SELECT image_url FROM property_images WHERE property_id = p.id LIMIT 1) as property_image
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN payments pg ON b.id = pg.booking_id
    `;
    const params = [];

    if (status) {
      query += ' WHERE b.booking_status = ?';
      params.push(status);
    }

    query += ' GROUP BY b.id ORDER BY b.created_at DESC';

    const [bookings] = await pool.query(query, params);

    const formatted = bookings.map((b) => ({
      ...b,
      images: b.property_image ? [b.property_image] : [],
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Updating booking:', id, status);
    await pool.query('UPDATE bookings SET booking_status = ? WHERE id = ?', [status, id]);

    // Get booking with property details
    const [rows] = await pool.query(
      `SELECT b.*, p.title, p.location, p.monthly_price, p.currency
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE b.id = ?`,
      [id]
    );

    if (rows.length > 0) {
      // If booking is approved, confirmed, or paid - mark property as booked and store the booking period
      if (status === 'approved' || status === 'confirmed' || status === 'completed') {
        const bookingPeriod = JSON.stringify({ 
          booking_id: id, 
          move_in: rows[0].move_in_date, 
          months: rows[0].months,
          move_out: rows[0].move_out_date,
          updated_at: new Date().toISOString()
        });
        await pool.query(
          `UPDATE properties SET status = 'booked', unavailable_dates = ? WHERE id = ?`,
          [bookingPeriod, rows[0].property_id]
        );
        console.log('[bookingController] Property marked as booked for booking:', id);
      }
      
      // Get user email
      const [users] = await pool.query('SELECT email, name FROM users WHERE id = ?', [rows[0].user_id]);
      const [settings] = await pool.query('SELECT * FROM settings LIMIT 1');
      const [paymentMethods] = await pool.query(
        `SELECT pm.* 
         FROM payment_methods pm
         JOIN property_payment_methods ppm ON pm.id = ppm.payment_method_id
         WHERE ppm.property_id = ? AND pm.is_active = TRUE`,
        [rows[0].property_id]
      );
      
      if (users.length > 0) {
        const userEmail = users[0].email;
        const userName = users[0].name;
        
        // Construct property object for email templates
        const propertyData = {
          title: rows[0].title,
          location: rows[0].location,
          monthly_price: rows[0].monthly_price,
          currency: rows[0].currency,
        };
        
        try {
          if (status === 'approved') {
            await sendBookingApproved(userEmail, userName, rows[0], propertyData, settings[0] || {});
          } else if (status === 'rejected') {
            await sendBookingRejected(userEmail, userName, rows[0], propertyData, settings[0] || {});
          }
        } catch (e) {
          console.log('Status email not sent:', e.message);
        }
      }
    }

    res.json({ message: 'Booking status updated' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { move_in_date, months, payment_method_id } = req.body;

    // Get current booking to check ownership
    const [current] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!current.length) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Allow admins to edit any booking, or users to edit their own bookings
    const isAdmin = req.user?.role === 'admin';
    const isOwner = current[0].user_id === req.user?.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to edit this booking' });
    }

    const updates = [];
    const params = [];

    // Only allow editing move_in_date and months
    if (move_in_date) {
      updates.push('move_in_date = ?');
      params.push(move_in_date);
      
      // Also update move_out_date based on new move_in_date and existing months
      const monthsToUse = months || current[0].months;
      const [y, m, d] = move_in_date.split('-').map(Number);
      const startDate = new Date(y, m - 1, d);
      startDate.setMonth(startDate.getMonth() + monthsToUse);
      const newMoveOutDate = startDate.toISOString().split('T')[0];
      
      updates.push('move_out_date = ?');
      params.push(newMoveOutDate);
    }

    if (months) {
      updates.push('months = ?');
      params.push(months);
      
      // Also update move_out_date based on existing move_in_date and new months
      if (!move_in_date && current[0].move_in_date) {
        const [y, m, d] = current[0].move_in_date.split('-').map(Number);
        const startDate = new Date(y, m - 1, d);
        startDate.setMonth(startDate.getMonth() + months);
        const newMoveOutDate = startDate.toISOString().split('T')[0];
        
        updates.push('move_out_date = ?');
        params.push(newMoveOutDate);
      }
    }

    // Allow updating payment method
    if (payment_method_id) {
      updates.push('payment_method_id = ?');
      params.push(payment_method_id);
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
