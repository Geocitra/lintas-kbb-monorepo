// apps/web/src/lib/api.ts
import axios from 'axios';

// Kita tidak perlu menulis localhost:3000 karena sudah di-proxy oleh Vite
export const api = axios.create({
  baseURL: '/api/v1', 
  timeout: 15000, // Maksimal loading 15 detik
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// REQUEST INTERCEPTOR: Menyuntikkan Token sebelum request meluncur
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Menangkap Balasan dari Server
api.interceptors.response.use(
  (response) => {
    // Sesuai standar ApiResponse dari @dishub/types
    return response.data; 
  },
  (error) => {
    if (!error.response) {
      console.error('[Network Error] Server tidak merespons.');
      return Promise.reject({ message: 'Sistem tidak dapat menghubungi server.' });
    }

    // Jika token tidak valid / kedaluwarsa / dipaksa logout oleh Admin
    if (error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Paksa pindah ke halaman login jika bukan sedang di halaman login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Lempar error format standar kita ke React Query/Komponen
    return Promise.reject(error.response.data);
  }
);
