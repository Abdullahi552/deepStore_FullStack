import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as adminController from '../controllers/admin.controller.js';
import { orderIdParamSchema } from '../validators/order.validator.js';
import {
    updateOrderStatusSchema,
    adminListOrdersQuerySchema,
} from '../validators/admin.validator.js';

// TODO (admin branch): GET /orders, GET /orders/:orderId,
//                      PATCH /orders/:orderId/status
const router = Router();

router.use(authenticate, requireAdmin);

router.get('/orders',
    validate({ query: adminListOrdersQuerySchema }),
    adminController.listOrders
);

router.get('/orders/:orderId',
    validate({ params: orderIdParamSchema }),
    adminController.getOrderById
);

router.patch('/orders/:orderId/status',
    validate({ params: orderIdParamSchema, body: updateOrderStatusSchema }),
    adminController.updateOrderStatus
);

export default router;