import { Router } from 'express';

import * as productController from '../controllers/product.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  listProductsQuerySchema,
} from '../validators/product.validator.js';

const router = Router();

// ---------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------

router.get(
  '/',
  validate({ query: listProductsQuerySchema }),
  productController.listProducts
);

router.get(
  '/:productId',
  validate({ params: productIdParamSchema }),
  productController.getProduct
);

// ---------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate({ body: createProductSchema }),
  productController.createProduct
);

router.patch(
  '/:productId',
  authenticate,
  requireAdmin,
  validate({ params: productIdParamSchema, body: updateProductSchema }),
  productController.updateProduct
);

router.delete(
  '/:productId',
  authenticate,
  requireAdmin,
  validate({ params: productIdParamSchema }),
  productController.deleteProduct
);

export default router;