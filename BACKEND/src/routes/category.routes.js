import { Router } from 'express';

import * as categoryController from '../controllers/category.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categorySlugParamSchema,
  listCategoriesQuerySchema,
} from '../validators/category.validator.js';

const router = Router();

// ---------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------

router.get(
  '/',
  validate({ query: listCategoriesQuerySchema }),
  categoryController.listCategories
);

// IMPORTANT: this route MUST be declared before /:categoryId
// otherwise Express would match "products-by-slug" as a categoryId.
router.get(
  '/:slug/products',
  validate({ params: categorySlugParamSchema, query: listCategoriesQuerySchema }),
  categoryController.getCategoryProducts
);

router.get(
  '/:categoryId',
  validate({ params: categoryIdParamSchema }),
  categoryController.getCategory
);

// ---------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate({ body: createCategorySchema }),
  categoryController.createCategory
);

router.patch(
  '/:categoryId',
  authenticate,
  requireAdmin,
  validate({ params: categoryIdParamSchema, body: updateCategorySchema }),
  categoryController.updateCategory
);

router.delete(
  '/:categoryId',
  authenticate,
  requireAdmin,
  validate({ params: categoryIdParamSchema }),
  categoryController.deleteCategory
);

export default router;