import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);
router.get('/', authenticate, authorize('admin'), getAllBookings);
router.put('/:id/status', authenticate, authorize('admin'), updateBookingStatus);

export default router;
