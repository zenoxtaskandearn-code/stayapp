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

// Temp: no auth for testing
router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.get('/', getAllBookings);
router.put('/:id/status', updateBookingStatus);

export default router;
