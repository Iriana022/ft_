import axios from 'axios';
import { clearAuthStorage } from './auth';

const api = axios.create({
  baseURL: `${window.location.origin}/api/`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuthStorage();
    }
    return Promise.reject(error);
  },
);

export default api;
