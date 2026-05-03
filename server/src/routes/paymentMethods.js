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
router.get('/:id', getPaymentMethodById);

// Make admin getAll public too (needed for property form)
router.get('/admin', getAllPaymentMethods);

// Admin routes that need auth
const adminAuth = [authenticate, authorize('admin')];

router.get('/admin/:id', ...adminAuth, getPaymentMethodById);
router.post('/admin', ...adminAuth, createPaymentMethod);
router.put('/admin/:id', ...adminAuth, updatePaymentMethod);
router.delete('/admin/:id', ...adminAuth, deletePaymentMethod);
router.put('/property/:propertyId', ...adminAuth, updatePropertyPaymentMethods);

export default router;
