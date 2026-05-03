import { pool } from '../config/db.js';

const addLogoColumn = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Check if logo column exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'payment_methods' AND COLUMN_NAME = 'logo'`
    );
    
    if (columns.length === 0) {
      await connection.query(
        `ALTER TABLE payment_methods ADD COLUMN logo VARCHAR(500) NULL`
      );
      console.log('✓ Added logo column to payment_methods table');
    } else {
      console.log('✓ Logo column already exists');
    }
    
    connection.release();
  } catch (error) {
    console.error('Error adding logo column:', error.message);
  }
};

export default addLogoColumn;
