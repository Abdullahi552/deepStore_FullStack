import client from './client';

export const cartApi = {
  getCart: async () => {
    const res = await client.get('/cart');
    return res.data.data;
  },
  addItem: async (productId, quantity = 1) => {
    const res = await client.post('/cart/items', { productId, quantity });
    return res.data.data;
  },
  updateQuantity: async (productId, quantity) => {
    const res = await client.patch(`/cart/items/${productId}`, { quantity });
    return res.data.data;
  },
  removeItem: async (productId) => {
    const res = await client.delete(`/cart/items/${productId}`);
    return res.data.data;
  },
  clearCart: async () => {
    const res = await client.delete('/cart');
    return res.data.data;
  }
};