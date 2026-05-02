import { pool } from '../config/db.js';

export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const [reviews] = await pool.query(
      `SELECT r.*, u.name as user_name, u.avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.property_id = ?
       ORDER BY r.created_at DESC`,
      [propertyId]
    );
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { property_id, rating, comment, user_id } = req.body;
    const userId = user_id || req.user?.id || 1;

    const [result] = await pool.query(
      'INSERT INTO reviews (user_id, property_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, property_id, rating, comment]
    );

    res.status(201).json({ id: result.insertId, message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
