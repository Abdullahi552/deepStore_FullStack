import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as orderController from '../controllers/order.controller.js';
import {
    createOrderSchema,
    orderIdParamSchema,
    listOrdersQuerySchema,
} from '../validators/order.validator.js';


// TODO (order branch): POST /, GET /, GET /:orderId, PATCH /:orderId/cancel
const router = Router();

router.use(authenticate);

router.post('/',
    validate({ body: createOrderSchema }),
    orderController.createOrder
);

router.get('/',
    validate({ query: listOrdersQuerySchema }),
    orderController.getMyOrders
);

router.get('/:orderId',
    validate({ params: orderIdParamSchema }),
    orderController.getMyOrderById
);

router.patch('/:orderId/cancel',
    validate({ params: orderIdParamSchema }),
    orderController.cancelMyOrder
);


export default router;