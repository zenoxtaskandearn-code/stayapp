import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM categories WHERE is_active = TRUE ORDER BY name');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (results.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)',
      [name, slug, description, icon]
    );
    res.status(201).json({ id: result.insertId, name, slug, description, icon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, icon, is_active } = req.body;
    await pool.query(
      'UPDATE categories SET name = ?, description = ?, icon = ?, is_active = ? WHERE id = ?',
      [name, description, icon, is_active, req.params.id]
    );
    res.json({ message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;