import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public - GET settings (needed for site config)
router.get('/', getSettings);
// Admin only - PUT settings
router.put('/', authenticate, authorize('admin'), updateSettings);

export default router;
