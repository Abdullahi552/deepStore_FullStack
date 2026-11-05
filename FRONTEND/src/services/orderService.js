import storage from "./storage";

export const orderService = {
    getOrders(userId) {
        if (!userId) return [];

        return storage.get(`orders_${userId}`) || [];
    },

    createOrder(userId, orderData) {
        if (!userId) {
            throw new Error("User ID is required");
        }

        const existingOrders = this.getOrders(userId);

        const order = {
            id: crypto.randomUUID(),
            userId,

            ...orderData,

            createdAt: new Date().toISOString(),
        };

        const updatedOrders = [order, ...existingOrders];

        storage.set(`orders_${userId}`, updatedOrders);

        return order;
    },
};
