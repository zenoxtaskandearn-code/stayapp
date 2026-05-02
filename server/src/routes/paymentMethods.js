import { Router } from 'express';
import { 
  getPaymentMethods, 
  getAllPaymentMethods, 
  getPaymentMethodById, 
  createPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod,
  getPropertyPaymentMethods,
  updatePropertyPaymentMethods 
} from '../controllers/paymentMethodController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getPaymentMethods);
router.get('/property/:propertyId', getPropertyPaymentMethods);

// Admin routes
const adminAuth = [authenticate, authorize('admin')];

router.get('/admin', ...adminAuth, getAllPaymentMethods);
router.post('/admin', ...adminAuth, createPaymentMethod);
router.put('/admin/:id', ...adminAuth, updatePaymentMethod);
router.delete('/admin/:id', ...adminAuth, deletePaymentMethod);
router.put('/property/:propertyId', ...adminAuth, updatePropertyPaymentMethods);

export default router;
