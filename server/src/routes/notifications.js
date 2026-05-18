import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Get all notifications (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications ORDER BY created_at DESC'
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread count (admin only)
router.get('/unread-count', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE is_read = FALSE'
    );
    res.json({ count: result[0].count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read (admin only)
router.put('/:id/read', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read (admin only)
router.put('/mark-all-read', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE');
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a notification (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all notifications (admin only)
router.delete('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications');
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create notification (internal use)
export const createNotification = async (type, title, message, data = {}) => {
  try {
    await pool.query(
      'INSERT INTO notifications (type, title, message, data) VALUES (?, ?, ?, ?)',
      [type, title, message, JSON.stringify(data)]
    );
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

export default router;
