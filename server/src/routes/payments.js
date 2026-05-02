import express from 'express';
import { uploadMiddleware, uploadPaymentScreenshot, verifyPayment, getPayments } from '../controllers/paymentController.js';

const router = express.Router();

// No auth for testing
router.get('/');
router.post('/:booking_id/screenshot', uploadMiddleware, uploadPaymentScreenshot);
router.put('/:id/verify', verifyPayment);

export default router;