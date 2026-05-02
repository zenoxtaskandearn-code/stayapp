import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getProperties,
  getPropertyById,
  getFeaturedProperties,
  getPropertyTypes,
  getLocations,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';

const router = express.Router();

// Specific routes FIRST (before /:id)
router.get('/featured', getFeaturedProperties);
router.get('/types', getPropertyTypes);
router.get('/locations', getLocations);

// General routes
router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Protected admin routes (temp: no auth for testing)
// router.post('/', authenticate, authorize('admin'), createProperty);
router.post('/', createProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

export default router;
