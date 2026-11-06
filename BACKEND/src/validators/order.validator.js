import { z } from 'zod';

export const orderIdParamSchema = z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order id'),
});

// Prices and totals are never accepted from the client — only optional delivery info.
export const createOrderSchema = z.object({
    shippingAddress: z.record(z.string(), z.any()).optional(),
});

export const listOrdersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
});