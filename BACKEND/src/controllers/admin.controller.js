import { asyncHandler } from '../utils/asyncHandler.js';
import { success, paginated } from '../utils/apiResponse.js';
import * as adminService from '../services/admin.service.js';

export const listOrders = asyncHandler(async (req, res) => {
    const { orders, pagination } = await adminService.listOrders(req.query);
    paginated(res, orders, pagination, 'Orders retrieved');
});

export const getOrderById = asyncHandler(async (req, res) => {
    const order = await adminService.getOrderById(req.params.orderId);
    success(res, order, 'Order retrieved');
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await adminService.updateOrderStatus(req.params.orderId, req.body.status);
    success(res, order, 'Order status updated');
});