import { z } from 'zod';

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// ---------------------------------------------------------------
// Body schemas
// ---------------------------------------------------------------

export const addCartItemSchema = z.object({
  productId: objectId,
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be at least 1')
    .default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be at least 1'),
});

// ---------------------------------------------------------------
// Params schemas
// ---------------------------------------------------------------

export const cartItemParamSchema = z.object({
  productId: objectId,
});