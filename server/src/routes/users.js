import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getUsers, updateUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), getUsers);
router.put('/:id', authenticate, authorize('admin'), updateUser);

export default router;
