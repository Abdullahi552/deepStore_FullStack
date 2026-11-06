import { z } from 'zod';
import { ORDER_STATUS_VALUES } from '../constants/orderStatus.js';

export const updateOrderStatusSchema = z.object({
    status: z.enum(ORDER_STATUS_VALUES),
});

export const adminListOrdersQuerySchema = z.object({
    status: z.enum(ORDER_STATUS_VALUES).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
});