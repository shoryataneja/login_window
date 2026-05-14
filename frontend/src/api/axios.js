import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
