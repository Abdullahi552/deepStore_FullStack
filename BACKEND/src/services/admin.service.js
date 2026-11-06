import { Order } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { ORDER_STATUS, canTransition } from '../constants/orderStatus.js';
import * as inventoryService from './inventory.service.js';
import { normalizePagination } from './order.service.js';

/** GET /admin/orders?status=&page=&limit= */
export const listOrders = async (query = {}) => {
    const { page, limit, skip } = normalizePagination(query);
    const filter = {};
    if (query.status) filter.status = query.status;

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Order.countDocuments(filter),
    ]);

    return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

/** GET /admin/orders/:orderId */
export const getOrderById = async (orderId) => {
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
        throw ApiError.notFound('Order not found', ERROR_CODES.ORDER_NOT_FOUND);
    }
    return order;
};

/** PATCH /admin/orders/:orderId/status */
export const updateOrderStatus = async (orderId, nextStatus) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw ApiError.notFound('Order not found', ERROR_CODES.ORDER_NOT_FOUND);
    }

    const invalid = () =>
        ApiError.badRequest(
            `Cannot move order from ${order.status} to ${nextStatus}`,
            ERROR_CODES.INVALID_ORDER_STATUS_TRANSITION
        );

    if (!canTransition(order.status, nextStatus)) throw invalid();

    // Guard on the status we validated against, so concurrent updates can't skip rules
    const updated = await Order.findOneAndUpdate(
        { _id: orderId, status: order.status },
        { status: nextStatus },
        { new: true, runValidators: true }
    );
    if (!updated) throw invalid();

    // Admin cancellation must release stock, same as customer cancellation
    if (nextStatus === ORDER_STATUS.CANCELLED) {
        await inventoryService.restoreStock(updated.items);
    }

    return updated;
};