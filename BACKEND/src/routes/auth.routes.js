import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from '../validators/auth.validator.js';

const router = Router();

// ---------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------

router.post(
  '/register',
  validate({ body: registerSchema }),
  authController.register
);

// Strict rate limit on login to slow brute-force attempts
router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  authController.login
);

router.post(
  '/refresh',
  validate({ body: refreshSchema }),
  authController.refresh
);

// ---------------------------------------------------------------
// Protected routes
// ---------------------------------------------------------------

router.post('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.me);

export default router;