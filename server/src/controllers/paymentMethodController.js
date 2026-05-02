import { pool } from '../config/db.js';

// Get all payment methods
export const getPaymentMethods = async (req, res) => {
  try {
    const [methods] = await pool.query(
      'SELECT * FROM payment_methods WHERE is_active = TRUE ORDER BY name'
    );
    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all payment methods (admin - including inactive)
export const getAllPaymentMethods = async (req, res) => {
  try {
    const [methods] = await pool.query(
      'SELECT * FROM payment_methods ORDER BY name'
    );
    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment method by ID
export const getPaymentMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    const [methods] = await pool.query(
      'SELECT * FROM payment_methods WHERE id = ?',
      [id]
    );
    
    if (!methods.length) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.json(methods[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create payment method
export const createPaymentMethod = async (req, res) => {
  try {
    const { name, description, instructions } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO payment_methods (name, description, instructions) VALUES (?, ?, ?)',
      [name, description || null, instructions || null]
    );

    const [method] = await pool.query(
      'SELECT * FROM payment_methods WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ message: 'Payment method created', paymentMethod: method[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update payment method
export const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, instructions, is_active } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM payment_methods WHERE id = ?',
      [id]
    );

    if (!existing.length) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    await pool.query(
      `UPDATE payment_methods SET 
        name = ?, 
        description = ?, 
        instructions = ?, 
        is_active = ?
      WHERE id = ?`,
      [
        name || existing[0].name,
        description !== undefined ? description : existing[0].description,
        instructions !== undefined ? instructions : existing[0].instructions,
        is_active !== undefined ? is_active : existing[0].is_active,
        id
      ]
    );

    const [method] = await pool.query(
      'SELECT * FROM payment_methods WHERE id = ?',
      [id]
    );

    res.json({ message: 'Payment method updated', paymentMethod: method[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete payment method
export const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM payment_methods WHERE id = ?',
      [id]
    );

    if (!existing.length) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Delete from junction table first
    await pool.query(
      'DELETE FROM property_payment_methods WHERE payment_method_id = ?',
      [id]
    );

    // Delete the payment method
    await pool.query(
      'DELETE FROM payment_methods WHERE id = ?',
      [id]
    );

    res.json({ message: 'Payment method deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment methods for a property
export const getPropertyPaymentMethods = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const [methods] = await pool.query(
      `SELECT pm.* 
       FROM payment_methods pm
       JOIN property_payment_methods ppm ON pm.id = ppm.payment_method_id
       WHERE ppm.property_id = ? AND pm.is_active = TRUE`,
      [propertyId]
    );

    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update payment methods for a property
export const updatePropertyPaymentMethods = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { payment_method_ids } = req.body;

    if (!Array.isArray(payment_method_ids)) {
      return res.status(400).json({ message: 'payment_method_ids must be an array' });
    }

    // Delete existing payment methods for this property
    await pool.query(
      'DELETE FROM property_payment_methods WHERE property_id = ?',
      [propertyId]
    );

    // Insert new payment methods
    if (payment_method_ids.length > 0) {
      const values = payment_method_ids.map(id => [propertyId, id]);
      await pool.query(
        'INSERT INTO property_payment_methods (property_id, payment_method_id) VALUES ?',
        [values]
      );
    }

    res.json({ message: 'Property payment methods updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
