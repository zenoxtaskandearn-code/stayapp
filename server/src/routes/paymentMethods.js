import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /admin - get all payment methods for admin
router.get('/admin', async (req, res) => {
  try {
    const [methods] = await pool.query('SELECT * FROM payment_methods ORDER BY name');
    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET / - get active payment methods (public)
router.get('/', async (req, res) => {
  try {
    const [methods] = await pool.query('SELECT * FROM payment_methods WHERE is_active = TRUE ORDER BY name');
    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /:id - get single payment method
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [methods] = await pool.query('SELECT * FROM payment_methods WHERE id = ?', [id]);
    if (!methods.length) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    res.json(methods[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;