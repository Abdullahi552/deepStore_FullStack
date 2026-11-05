import { z } from 'zod';

// MongoDB ObjectId: 24-char hex string
const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// ---------------------------------------------------------------
// Body schemas
// ---------------------------------------------------------------

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be 1000 characters or fewer')
    .optional(),
  image: z
    .string()
    .trim()
    .url('Image must be a valid URL')
    .optional()
    .or(z.literal('')),
});

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name cannot be empty')
      .max(100, 'Name must be 100 characters or fewer')
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, 'Description must be 1000 characters or fewer')
      .optional(),
    image: z
      .string()
      .trim()
      .url('Image must be a valid URL')
      .optional()
      .or(z.literal('')),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'At least one field must be provided',
  });

// ---------------------------------------------------------------
// Params schemas
// ---------------------------------------------------------------

export const categoryIdParamSchema = z.object({
  categoryId: objectId,
});

export const categorySlugParamSchema = z.object({
  slug: z.string().trim().min(1, 'Slug is required'),
});

// ---------------------------------------------------------------
// Query schemas
// ---------------------------------------------------------------

export const listCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});