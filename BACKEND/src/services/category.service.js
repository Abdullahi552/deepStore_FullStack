import { Category, Product } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { slugify } from '../utils/slugify.js';

// ---------------------------------------------------------------
// Internal helper — throw a 404 if the category doesn't exist
// ---------------------------------------------------------------
const findCategoryOrFail = async (query, { activeOnly = false } = {}) => {
  const finalQuery = activeOnly ? { ...query, isActive: true } : query;
  const category = await Category.findOne(finalQuery);
  if (!category) {
    throw ApiError.notFound('Category not found', ERROR_CODES.CATEGORY_NOT_FOUND);
  }
  return category;
};

// Convert a Mongo duplicate-key error into a clean ApiError
const translateDuplicateSlug = (err, slug) => {
  if (err.code === 11000 && err.keyValue?.slug) {
    return ApiError.conflict(
      `Category with slug "${slug}" already exists`,
      ERROR_CODES.CATEGORY_SLUG_EXISTS
    );
  }
  return err;
};

// ---------------------------------------------------------------
// Public reads
// ---------------------------------------------------------------

export const listCategories = async ({ page = 1, limit = 20 }) => {
  const filter = { isActive: true };
  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    Category.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    Category.countDocuments(filter),
  ]);

  return { categories, page, limit, total };
};

export const getCategoryById = async (categoryId) => {
  return findCategoryOrFail({ _id: categoryId }, { activeOnly: true });
};

export const getCategoryBySlug = async (slug) => {
  return findCategoryOrFail({ slug }, { activeOnly: true });
};

export const getProductsByCategorySlug = async (slug, { page = 1, limit = 20 }) => {
  const category = await findCategoryOrFail({ slug }, { activeOnly: true });

  const filter = { category: category._id, isActive: true };
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);

  return { category, products, page, limit, total };
};

// ---------------------------------------------------------------
// Admin writes
// ---------------------------------------------------------------

export const createCategory = async (data) => {
  const slug = slugify(data.name);

  try {
    return await Category.create({
      name: data.name,
      slug,
      description: data.description ?? '',
      image: data.image ?? '',
    });
  } catch (err) {
    throw translateDuplicateSlug(err, slug);
  }
};

export const updateCategory = async (categoryId, data) => {
  const category = await findCategoryOrFail({ _id: categoryId });

  // Regenerate slug only if the name actually changed
  if (data.name !== undefined && data.name !== category.name) {
    category.name = data.name;
    category.slug = slugify(data.name);
  }
  if (data.description !== undefined) category.description = data.description;
  if (data.image !== undefined) category.image = data.image;
  if (data.isActive !== undefined) category.isActive = data.isActive;

  try {
    await category.save();
    return category;
  } catch (err) {
    throw translateDuplicateSlug(err, category.slug);
  }
};

export const deleteCategory = async (categoryId) => {
  const category = await findCategoryOrFail({ _id: categoryId });
  category.isActive = false;
  await category.save();
  return category;
};