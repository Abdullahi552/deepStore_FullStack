import { Order, Cart, Product } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { ORDER_STATUS, isCancellable } from '../constants/orderStatus.js';
import { DEFAULT_SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '../constants/money.js';
import * as inventoryService from './inventory.service.js';

const CANCELLABLE_STATUSES = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED];

export const normalizePagination = ({ page, limit } = {}) => {
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    return { page: p, limit: l, skip: (p - 1) * l };
};

/** POST /orders — checkout */
export const createOrder = async (userId, body = {}) => {

    // const product = await Product.create({
    //     name: "Wireless Ergonomic Mouse",
    //     slug: "wireless-ergonomic-mouse-06",
    //     description: "A high-precision wireless mouse designed for long hours of comfortable office work or gaming.",
    //     price: 4500,
    //     images: [
    //         "https://example.com",
    //         "https://example.com"
    //     ],
    //     category: "65c2a1b5f1d4c32a88e91111",
    //     stock: 120,
    //     isActive: true
    // });
    // const carts = await Cart.create({ user: userId, items: [{ product: product._id, quantity: 2 }] });

    // 2. Load cart
    const cart = await Cart.findOne({ user: userId });
    await console.log("Cart found");
    if (!cart || cart.items.length === 0) {
        throw ApiError.badRequest('Your cart is empty', ERROR_CODES.CART_EMPTY);
    }

    // 3. Verify each item (product exists, active, in stock)
    const productIds = cart.items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    await console.log("Products found:", products.length);

    const items = [];
    for (const cartItem of cart.items) {
        const product = productMap.get(cartItem.product.toString());
        if (!product || !product.isActive) {
            throw ApiError.notFound('Product not found', ERROR_CODES.PRODUCT_NOT_FOUND);
        }
        if (cartItem.quantity > product.stock) {
            throw ApiError.conflict(
                `Insufficient stock for "${product.name}"`,
                ERROR_CODES.INSUFFICIENT_STOCK
            );
        }

        // 4. Authoritative price from the DB, snapshotted now
        items.push({
            product: product._id,
            name: product.name,
            image: product.images?.[0] ?? product.image,
            price: product.price,
            quantity: cartItem.quantity,
        });
    }

    // 5. Integer math only
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
    const total = subtotal + shippingFee;

    // 6. Create order (orderNumber assigned by the model's pre('validate') hook)
    const order = await Order.create({
        user: userId,
        items,
        subtotal,
        shippingFee,
        total,
        ...(body.shippingAddress && { shippingAddress: body.shippingAddress }),
    });

    // 7. Decrement stock (best-effort), 8. clear cart
    await inventoryService.decrementStock(items);
    cart.items = [];
    await cart.save();

    // 9. Return
    await console.log("order created:", order.length);
    return order;
};

/** GET /orders — own history */
export const getUserOrders = async (userId, query = {}) => {
    const { page, limit, skip } = normalizePagination(query);
    const filter = { user: userId };

    const [orders, total] = await Promise.all([
        Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(filter),
    ]);

    return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

/** GET /orders/:orderId — own detail (other users' orders look like 404) */
export const getUserOrderById = async (userId, orderId) => {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
        throw ApiError.notFound('Order not found', ERROR_CODES.ORDER_NOT_FOUND);
    }
    return order;
};

/** PATCH /orders/:orderId/cancel */
export const cancelOrder = async (userId, orderId) => {
    const existing = await Order.findOne({ _id: orderId, user: userId });
    if (!existing) {
        throw ApiError.notFound('Order not found', ERROR_CODES.ORDER_NOT_FOUND);
    }
    if (!isCancellable(existing.status)) {
        throw ApiError.badRequest(
            'Order cannot be cancelled at this stage',
            ERROR_CODES.ORDER_CANNOT_BE_CANCELLED
        );
    }

    // Atomic status guard: prevents double-cancel from restoring stock twice
    const order = await Order.findOneAndUpdate(
        { _id: orderId, user: userId, status: { $in: CANCELLABLE_STATUSES } },
        { status: ORDER_STATUS.CANCELLED },
        { new: true }
    );
    if (!order) {
        throw ApiError.badRequest(
            'Order cannot be cancelled at this stage',
            ERROR_CODES.ORDER_CANNOT_BE_CANCELLED
        );
    }

    await inventoryService.restoreStock(order.items);

    return order;
};