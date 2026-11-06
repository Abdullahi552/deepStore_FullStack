import { Product } from '../models/index.js';

/**
 * Decrement stock for each order item.
 * Best-effort (Atlas M0 has no multi-document transactions): each decrement is
 * an atomic conditional update. A failed decrement is logged and skipped.
 * Returns the list of product ids that could not be decremented.
 */
export const decrementStock = async (items) => {
    const failed = [];

    for (const item of items) {
        try {
            const result = await Product.updateOne(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } }
            );
            if (result.modifiedCount === 0) {
                failed.push(item.product);
                console.error(`[inventory] stock decrement skipped for product ${item.product}`);
            }
        } catch (err) {
            failed.push(item.product);
            console.error(`[inventory] stock decrement failed for product ${item.product}:`, err);
        }
    }

    return failed;
};

/** Restore stock for each order item (cancellation). */
export const restoreStock = async (items) => {
    for (const item of items) {
        try {
            await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
        } catch (err) {
            console.error(`[inventory] stock restore failed for product ${item.product}:`, err);
        }
    }
};