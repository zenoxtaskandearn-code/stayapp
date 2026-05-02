import { pool } from '../config/db.js';

const addMapLink = async () => {
  try {
    await pool.query(
      `ALTER TABLE properties ADD COLUMN map_link TEXT NULL AFTER location`
    );
    console.log('✅ Added map_link column to properties table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addMapLink();
