import { Product, Category } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { slugify } from '../utils/slugify.js';

// ---------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------

const findProductOrFail = async (query, { activeOnly = false } = {}) => {
  const finalQuery = activeOnly ? { ...query, isActive: true } : query;
  const product = await Product.findOne(finalQuery).populate('category', 'name slug');
  if (!product) {
    throw ApiError.notFound('Product not found', ERROR_CODES.PRODUCT_NOT_FOUND);
  }
  return product;
};

const translateDuplicateSlug = (err, slug) => {
  if (err.code === 11000 && err.keyValue?.slug) {
    return ApiError.conflict(
      `Product with slug "${slug}" already exists`,
      ERROR_CODES.PRODUCT_SLUG_EXISTS
    );
  }
  return err;
};

// Verify the referenced category exists and is active. Throws on failure.
const assertCategoryExists = async (categoryId) => {
  const category = await Category.findOne({ _id: categoryId, isActive: true });
  if (!category) {
    throw ApiError.badRequest(
      'Referenced category does not exist or is inactive',
      ERROR_CODES.CATEGORY_NOT_FOUND
    );
  }
  return category;
};

// Build the Mongo filter from validated query params
const buildListFilter = ({ search, category, minPrice, maxPrice }) => {
  const filter = { isActive: true };

  if (search) {
    // Escape regex metacharacters so user input can't inject patterns
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { description: { $regex: safe, $options: 'i' } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  return filter;
};

// ---------------------------------------------------------------
// Public reads
// ---------------------------------------------------------------

export const listProducts = async ({
  page = 1,
  limit = 20,
  search,
  category,
  minPrice,
  maxPrice,
}) => {
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw ApiError.badRequest(
      'minPrice cannot exceed maxPrice',
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const filter = buildListFilter({ search, category, minPrice, maxPrice });
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);

  return { products, page, limit, total };
};

export const getProductById = async (productId) => {
  return findProductOrFail({ _id: productId }, { activeOnly: true });
};

// ---------------------------------------------------------------
// Admin writes
// ---------------------------------------------------------------

export const createProduct = async (data) => {
  const slug = slugify(data.name);

  await assertCategoryExists(data.category);

  try {
    const product = await Product.create({
      name: data.name,
      slug,
      description: data.description ?? '',
      price: data.price,
      category: data.category,
      stock: data.stock ?? 0,
      images: data.images ?? [],
    });
    await product.populate('category', 'name slug');
    return product;
  } catch (err) {
    throw translateDuplicateSlug(err, slug);
  }
};

export const updateProduct = async (productId, data) => {
  const product = await findProductOrFail({ _id: productId });

  // If changing category, make sure the new one exists and is active
  if (data.category !== undefined && data.category !== product.category.toString()) {
    await assertCategoryExists(data.category);
    product.category = data.category;
  }

  // If changing name, regenerate slug
  if (data.name !== undefined && data.name !== product.name) {
    product.name = data.name;
    product.slug = slugify(data.name);
  }

  if (data.description !== undefined) product.description = data.description;
  if (data.price !== undefined) product.price = data.price;
  if (data.stock !== undefined) product.stock = data.stock;
  if (data.images !== undefined) product.images = data.images;
  if (data.isActive !== undefined) product.isActive = data.isActive;

  try {
    await product.save();
    return product.populate('category', 'name slug');
  } catch (err) {
    throw translateDuplicateSlug(err, product.slug);
  }
};

export const deleteProduct = async (productId) => {
  const product = await findProductOrFail({ _id: productId });
  product.isActive = false;
  await product.save();
  return product.populate('category', 'name slug');
};