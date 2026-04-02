import axios from 'axios';

const host = typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : 'localhost';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || `http://${host}:4000/api`
});

export default api;
