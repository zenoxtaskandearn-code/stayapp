import { pool } from '../config/db.js';

export const getProperties = async (req, res) => {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      propertyType,
      furnished,
      status = 'available', // default to available for public
      page = 1,
      limit = 12,
      sort = 'created_at',
      order = 'DESC',
    } = req.query;

    let query = `
      SELECT p.*, c.name as category_name,
      (SELECT GROUP_CONCAT(image_url) FROM property_images WHERE property_id = p.id) as images,
      (SELECT GROUP_CONCAT(payment_method_id) FROM property_payment_methods WHERE property_id = p.id) as payment_method_ids
      FROM properties p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    
    const params = [];
    
    // Add WHERE clause based on status
    // If status is 'all', show all (admin)
    // Otherwise show 'available' AND 'deleted' properties (users see all, but deleted ones redirect to Yahoo)
    if (status === 'all') {
      // Admin: show all properties
    } else {
      // Public/Users: show available and deleted properties
      query += ' WHERE (p.status = ? OR p.status = ?)';
      params.push('available', 'deleted');
    }

    if (location) {
      query += ' AND p.location LIKE ?';
      params.push(`%${location}%`);
    }
    if (minPrice) {
      query += ' AND p.monthly_price >= ?';
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ' AND p.monthly_price <= ?';
      params.push(maxPrice);
    }
    if (bedrooms) {
      query += ' AND p.bedrooms >= ?';
      params.push(bedrooms);
    }
    if (bathrooms) {
      query += ' AND p.bathrooms >= ?';
      params.push(bathrooms);
    }
    if (propertyType) {
      query += ' AND p.property_type = ?';
      params.push(propertyType);
    }
    if (furnished) {
      query += ' AND p.furnished = ?';
      params.push(furnished);
    }

    query += ' GROUP BY p.id';

    const validSortFields = ['created_at', 'monthly_price', 'bedrooms'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    query += ` ORDER BY p.${sortField} ${order === 'ASC' ? 'ASC' : 'DESC'}`;

    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [properties] = await pool.query(query, params);

    const countQuery = status && status !== 'all' 
      ? 'SELECT COUNT(*) as total FROM properties WHERE status = ?'
      : 'SELECT COUNT(*) as total FROM properties';
    const countParams = status && status !== 'all' ? [status] : [];
    const [countResult] = await pool.query(countQuery, countParams);

    const formattedProperties = properties.map((p) => {
      let amenities = [];
      if (Array.isArray(p.amenities)) {
        amenities = p.amenities;
      } else if (typeof p.amenities === 'string') {
        try {
          amenities = JSON.parse(p.amenities);
        } catch (e) {
          amenities = p.amenities.split(',').map(a => a.trim());
        }
      }
      return {
        ...p,
        images: p.images ? p.images.split(',') : [],
        amenities,
      };
    });

    res.json({
      properties: formattedProperties,
      total: countResult[0].total,
      page: Number(page),
      totalPages: Math.ceil(countResult[0].total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [properties] = await pool.query(
      `SELECT p.*, 
              (SELECT GROUP_CONCAT(image_url) FROM property_images WHERE property_id = p.id) as images
       FROM properties p
       WHERE p.id = ?`,
      [id]
    );
    
    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    const property = properties[0];
    property.images = property.images ? property.images.split(',') : [];
    
    if (Array.isArray(property.amenities)) {
      // already an array
    } else if (typeof property.amenities === 'string') {
      try {
        property.amenities = JSON.parse(property.amenities);
      } catch (e) {
        property.amenities = property.amenities.split(',').map(a => a.trim());
      }
    } else {
      property.amenities = [];
    }
    
    // Get payment methods for this property
    const [paymentMethods] = await pool.query(
      `SELECT pm.* 
       FROM payment_methods pm
       JOIN property_payment_methods ppm ON pm.id = ppm.payment_method_id
       WHERE ppm.property_id = ? AND pm.is_active = TRUE`,
      [id]
    );
    property.payment_methods = paymentMethods || [];
    
    // Get reviews
    const [reviews] = await pool.query(
      `SELECT r.*, u.name as user_name, u.avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.property_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );
    
    property.reviews = reviews;
    
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedProperties = async (req, res) => {
  try {
    const [properties] = await pool.query(
      `SELECT p.*, GROUP_CONCAT(pi.image_url) as images
       FROM properties p
       LEFT JOIN property_images pi ON p.id = pi.property_id
       WHERE p.featured = TRUE AND p.status = 'available'
       GROUP BY p.id
       LIMIT 6`
    );

    const formatted = properties.map((p) => {
      let amenities = [];
      if (Array.isArray(p.amenities)) {
        amenities = p.amenities;
      } else if (typeof p.amenities === 'string') {
        try {
          amenities = JSON.parse(p.amenities);
        } catch (e) {
          amenities = p.amenities.split(',').map(a => a.trim());
        }
      }
      return {
        ...p,
        images: p.images ? p.images.split(',') : [],
        amenities,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPropertyTypes = async (req, res) => {
  try {
    const [types] = await pool.query(
      `SELECT property_type, COUNT(*) as count
       FROM properties
       WHERE status = 'available'
       GROUP BY property_type
       ORDER BY count DESC`
    );
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLocations = async (req, res) => {
  try {
    const [locations] = await pool.query(
      `SELECT
        CASE
          WHEN location LIKE '%,%' THEN TRIM(SUBSTRING_INDEX(location, ',', -1))
          ELSE location
        END as city,
        COUNT(*) as count
       FROM properties
       WHERE status = 'available'
       GROUP BY city
       ORDER BY count DESC
       LIMIT 8`
    );
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProperty = async (req, res) => {
  try {
    const data = req.body;
    const { images, ...props } = data;
    
    const [result] = await pool.query(
      'INSERT INTO properties SET ?',
      [{ ...props, featured: data.featured || 0, amenities: JSON.stringify(data.amenities || []) }]
    );

    if (images && images.length > 0) {
      const imageValues = images.map((url, i) => [result.insertId, url, i === 0]);
      await pool.query(
        'INSERT INTO property_images (property_id, image_url, is_primary) VALUES ?',
        [imageValues]
      );
    }

    res.status(201).json({ id: result.insertId, message: 'Property created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.amenities) {
      updates.amenities = JSON.stringify(updates.amenities);
    }

    const fields = Object.keys(updates)
      .filter(key => key !== 'images')
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.keys(updates)
      .filter(key => key !== 'images')
      .map(key => updates[key]);

    await pool.query(`UPDATE properties SET ${fields} WHERE id = ?`, [...values, id]);

    if (updates.images && updates.images.length > 0) {
      await pool.query('DELETE FROM property_images WHERE property_id = ?', [id]);
      const imageValues = updates.images.map((url, i) => [id, url, i === 0]);
      await pool.query(
        'INSERT INTO property_images (property_id, image_url, is_primary) VALUES ?',
        [imageValues]
      );
    }

    res.json({ message: 'Property updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get property details first
    const [property] = await pool.query('SELECT * FROM properties WHERE id = ?', [id]);
    
    if (property.length > 0) {
      // Mark property as deleted instead of actually deleting it
      // This allows users to still see the property in listings but redirects to Yahoo
      await pool.query('UPDATE properties SET status = ? WHERE id = ?', ['deleted', id]);
      
      res.json({ 
        message: 'Property deleted successfully'
      });
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
