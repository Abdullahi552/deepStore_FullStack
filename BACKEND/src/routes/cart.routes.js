import { Router } from 'express';

import * as cartController from '../controllers/cart.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  addCartItemSchema,
  updateCartItemSchema,
  cartItemParamSchema,
} from '../validators/cart.validator.js';

const router = Router();

// Every cart route requires authentication.
// A cart belongs to exactly one user (req.user.id).
router.use(authenticate);

// ---------------------------------------------------------------
// Cart
// ---------------------------------------------------------------

router.get('/', cartController.getCart);

router.delete('/', cartController.clearCart);

// ---------------------------------------------------------------
// Cart items
// ---------------------------------------------------------------

router.post(
  '/items',
  validate({ body: addCartItemSchema }),
  cartController.addItem
);

router.patch(
  '/items/:productId',
  validate({ params: cartItemParamSchema, body: updateCartItemSchema }),
  cartController.updateItem
);

router.delete(
  '/items/:productId',
  validate({ params: cartItemParamSchema }),
  cartController.removeItem
);

export default router;