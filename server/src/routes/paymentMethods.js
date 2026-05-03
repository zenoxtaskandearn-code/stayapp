import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// DEBUG: Test endpoint
router.get('/debug', (req, res) => {
  res.json({ routes: 'loaded', time: new Date().toISOString() });
});

// ADMIN: Get all - IMPORTANT: must be before /:id route
router.get('/admin', async (req, res) => {
  console.log('[payment-methods] GET /admin called');
  try {
    const [methods] = await pool.query('SELECT * FROM payment_methods ORDER BY name');
    res.json(methods);
  } catch (error) {
    console.error('[payment-methods] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Get single by ID
router.get('/admin/:id', async (req, res) => {
  console.log('[payment-methods] GET /admin/:id called with id:', req.params.id);
  try {
    const [methods] = await pool.query('SELECT * FROM payment_methods WHERE id = ?', [req.params.id]);
    if (!methods.length) return res.status(404).json({ message: 'Not found' });
    res.json(methods[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Create
router.post('/admin', authenticate, authorize('admin'), async (req, res) => {
  console.log('[payment-methods] POST /admin called');
  try {
    const { name, description, instructions, is_active } = req.body;
    const [r] = await pool.query(
      'INSERT INTO payment_methods (name, description, instructions, is_active) VALUES (?, ?, ?, ?)',
      [name, description, instructions, is_active ?? true]
    );
    res.status(201).json({ id: r.insertId, message: 'Created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Update
router.put('/admin/:id', authenticate, authorize('admin'), async (req, res) => {
  console.log('[payment-methods] PUT /admin/:id called with id:', req.params.id);
  try {
    const { name, description, instructions, is_active } = req.body;
    await pool.query(
      'UPDATE payment_methods SET name = ?, description = ?, instructions = ?, is_active = ? WHERE id = ?',
      [name, description, instructions, is_active, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Delete
router.delete('/admin/:id', authenticate, authorize('admin'), async (req, res) => {
  console.log('[payment-methods] DELETE /admin/:id called with id:', req.params.id);
  try {
    await pool.query('DELETE FROM payment_methods WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUBLIC: Get active (must be after /admin to avoid conflict)
router.get('/', async (req, res) => {
  try {
    const [methods] = await pool.query('SELECT * FROM payment_methods WHERE is_active = TRUE ORDER BY name');
    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUBLIC: Get by ID (must be last)
router.get('/:id', async (req, res) => {
  try {
    const [methods] = await pool.query('SELECT * FROM payment_methods WHERE id = ?', [req.params.id]);
    if (!methods.length) return res.status(404).json({ message: 'Not found' });
    res.json(methods[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;