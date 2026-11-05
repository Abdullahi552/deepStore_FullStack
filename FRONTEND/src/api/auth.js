import client from './client';

export const authApi = {
  register: async (name, email, password) => {
    const res = await client.post('/auth/register', { name, email, password });
    return res.data;
  },
  login: async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    // Backend returns { accessToken, user }
    localStorage.setItem('access_token', res.data.data.accessToken);
    return res.data.data.user;
  },
  getMe: async () => {
    const res = await client.get('/auth/me');
    return res.data.data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
  }
};