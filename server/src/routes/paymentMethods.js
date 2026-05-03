import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// ADMIN: Get all
router.get('/admin', async (req, res) => {
  try {
    const [methods] = await pool.query('SELECT * FROM payment_methods ORDER BY name');
    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Get single by ID
router.get('/admin/:id', async (req, res) => {
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
  try {
    await pool.query('DELETE FROM payment_methods WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PROPERTY: Get payment methods for a specific property (must come BEFORE /:id)
router.get('/property/:propertyId', async (req, res) => {
  try {
    const [methods] = await pool.query(
      `SELECT pm.* FROM payment_methods pm
       JOIN property_payment_methods ppm ON pm.id = ppm.payment_method_id
       WHERE ppm.property_id = ? AND pm.is_active = TRUE`,
      [req.params.propertyId]
    );
    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PROPERTY: Update payment methods for a property (admin only)
router.put('/property/:propertyId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { payment_method_ids } = req.body;
    
    // Remove existing associations
    await pool.query('DELETE FROM property_payment_methods WHERE property_id = ?', [propertyId]);
    
    // Add new associations
    if (payment_method_ids?.length) {
      for (const pmId of payment_method_ids) {
        await pool.query(
          'INSERT INTO property_payment_methods (property_id, payment_method_id) VALUES (?, ?)',
          [propertyId, pmId]
        );
      }
    }
    
    res.json({ message: 'Payment methods updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUBLIC: Get active
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