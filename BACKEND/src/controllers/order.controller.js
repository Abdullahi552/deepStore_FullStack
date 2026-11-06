import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, paginated } from '../utils/apiResponse.js';
import * as orderService from '../services/order.service.js';

export const createOrder = asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.user.id, req.body);
    created(res, order, 'Order placed successfully');
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const { orders, pagination } = await orderService.getUserOrders(req.user.id, req.query);
    paginated(res, orders, pagination, 'Orders retrieved');
});

export const getMyOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getUserOrderById(req.user.id, req.params.orderId);
    success(res, order, 'Order retrieved');
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
    const order = await orderService.cancelOrder(req.user.id, req.params.orderId);
    success(res, order, 'Order cancelled');
});