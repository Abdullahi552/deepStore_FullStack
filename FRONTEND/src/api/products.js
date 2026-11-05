import client from './client';

export const productApi = {
  getAll: async () => {
    const res = await client.get('/products?limit=100'); // Fetch all for homepage
    return res.data.data;
  },
  getById: async (id) => {
    const res = await client.get(`/products/${id}`);
    return res.data.data;
  },
  getByCategory: async (categoryName) => {
    // Note: Backend categories use slugs (e.g., 'gadget')
    const res = await client.get(`/categories/${categoryName}/products`);
    return res.data.data;
  }
};