import { pool } from '../config/db.js';

export const getSettings = async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT * FROM settings LIMIT 1');
    res.json(settings[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const {
      website_name,
      theme_color,
      footer_text,
      contact_email,
      contact_phone,
      payment_instructions,
      bank_name,
      account_name,
      account_number,
      currency,
    } = req.body;

    // First check if settings row exists
    const [existing] = await pool.query('SELECT id FROM settings LIMIT 1');
    
    if (existing.length === 0) {
      // Insert if doesn't exist
      await pool.query(
        `INSERT INTO settings (website_name, theme_color, footer_text, contact_email, contact_phone, payment_instructions, bank_name, account_name, account_number, currency)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [website_name, theme_color, footer_text, contact_email, contact_phone, payment_instructions, bank_name, account_name, account_number, currency || 'USD']
      );
    } else {
      // Update if exists
      await pool.query(
        `UPDATE settings SET
          website_name = ?,
          theme_color = ?,
          footer_text = ?,
          contact_email = ?,
          contact_phone = ?,
          payment_instructions = ?,
          bank_name = ?,
          account_name = ?,
          account_number = ?,
          currency = ?
        WHERE id = 1`,
        [website_name, theme_color, footer_text, contact_email, contact_phone, payment_instructions, bank_name, account_name, account_number, currency || 'USD']
      );
    }

    const [settings] = await pool.query('SELECT * FROM settings LIMIT 1');
    res.json(settings[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
