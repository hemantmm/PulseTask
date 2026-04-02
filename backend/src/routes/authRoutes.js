import { Router } from 'express';
import {
  createUserByAdmin,
  listUsers,
  login,
  me,
  register
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.get('/users', requireAuth, requireRole('admin'), listUsers);
router.post('/users', requireAuth, requireRole('admin'), createUserByAdmin);

export default router;
