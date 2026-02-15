const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://e3-e4-backend.vercel.app');
export const API_URL = `${BASE_URL}/api`;
