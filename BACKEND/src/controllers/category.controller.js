import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, paginated } from '../utils/apiResponse.js';
import * as categoryService from '../services/category.service.js';

// ---------------------------------------------------------------
// Public reads
// ---------------------------------------------------------------

export const listCategories = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const { categories, total } = await categoryService.listCategories({ page, limit });

  return paginated(res, categories, { page, limit, total }, 'Categories retrieved');
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.categoryId);

  return success(res, category, 'Category retrieved');
});

export const getCategoryProducts = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { page, limit } = req.query;

  const { category, products, total } = await categoryService.getProductsByCategorySlug(
    slug,
    { page, limit }
  );

  return paginated(
    res,
    products,
    { page, limit, total },
    `Products in "${category.name}" retrieved`
  );
});

// ---------------------------------------------------------------
// Admin writes
// ---------------------------------------------------------------

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  return created(res, category, 'Category created');
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.categoryId, req.body);

  return success(res, category, 'Category updated');
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.deleteCategory(req.params.categoryId);

  return success(res, category, 'Category deactivated');
});