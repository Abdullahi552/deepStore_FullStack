import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, paginated } from '../utils/apiResponse.js';
import * as productService from '../services/product.service.js';

// ---------------------------------------------------------------
// Public reads
// ---------------------------------------------------------------

export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, search, category, minPrice, maxPrice } = req.query;
  const { products, total } = await productService.listProducts({
    page,
    limit,
    search,
    category,
    minPrice,
    maxPrice,
  });

  return paginated(res, products, { page, limit, total }, 'Products retrieved');
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.productId);

  return success(res, product, 'Product retrieved');
});

// ---------------------------------------------------------------
// Admin writes
// ---------------------------------------------------------------

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);

  return created(res, product, 'Product created');
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.productId, req.body);

  return success(res, product, 'Product updated');
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.productId);

  return success(res, product, 'Product deactivated');
});