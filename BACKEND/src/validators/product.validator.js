import { z } from 'zod';

// MongoDB ObjectId: 24-char hex string
const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// ---------------------------------------------------------------
// Body schemas
// ---------------------------------------------------------------

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or fewer'),
  description: z
    .string()
    .trim()
    .max(5000, 'Description must be 5000 characters or fewer')
    .optional(),
  price: z
    .number()
    .int('Price must be an integer (smallest currency unit)')
    .nonnegative('Price cannot be negative'),
  category: objectId,
  stock: z
    .number()
    .int('Stock must be an integer')
    .nonnegative('Stock cannot be negative')
    .default(0),
  images: z.array(z.string().url('Each image must be a valid URL')).optional(),
});

export const updateProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name cannot be empty')
      .max(200, 'Name must be 200 characters or fewer')
      .optional(),
    description: z
      .string()
      .trim()
      .max(5000, 'Description must be 5000 characters or fewer')
      .optional(),
    price: z
      .number()
      .int('Price must be an integer (smallest currency unit)')
      .nonnegative('Price cannot be negative')
      .optional(),
    category: objectId.optional(),
    stock: z
      .number()
      .int('Stock must be an integer')
      .nonnegative('Stock cannot be negative')
      .optional(),
    images: z.array(z.string().url('Each image must be a valid URL')).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'At least one field must be provided',
  });

// ---------------------------------------------------------------
// Params schemas
// ---------------------------------------------------------------

export const productIdParamSchema = z.object({
  productId: objectId,
});

// ---------------------------------------------------------------
// Query schemas
// ---------------------------------------------------------------

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().min(1).max(200).optional(),
  category: objectId.optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
});