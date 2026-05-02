import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getPropertyReviews, createReview } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/property/:propertyId', getPropertyReviews);
router.post('/', authenticate, createReview);

export default router;
