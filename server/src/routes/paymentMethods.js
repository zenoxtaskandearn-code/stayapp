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

// Admin routes - make these public too for now (can restrict later)
router.get('/admin', getAllPaymentMethods);
router.get('/admin/all', getAllPaymentMethods);
router.get('/admin/list', getAllPaymentMethods);

// Auth-protected admin routes
const adminAuth = [authenticate, authorize('admin')];

router.post('/admin', ...adminAuth, createPaymentMethod);
router.put('/admin/:id', ...adminAuth, updatePaymentMethod);
router.delete('/admin/:id', ...adminAuth, deletePaymentMethod);
router.put('/property/:propertyId', ...adminAuth, updatePropertyPaymentMethods);

export default router;
