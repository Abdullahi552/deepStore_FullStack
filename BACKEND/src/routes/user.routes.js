import { Router } from 'express';

import * as userController from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/user.validator.js';

const router = Router();

// Every user route operates on the authenticated user
router.use(authenticate);

router.get('/me', userController.getMe);

router.patch(
  '/me',
  validate({ body: updateProfileSchema }),
  userController.updateMe
);

router.patch(
  '/me/password',
  validate({ body: changePasswordSchema }),
  userController.changePassword
);

export default router;