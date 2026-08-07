// apps/web/src/App.tsx
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes';
import { useAuthStore } from '@/store/useAuthStore';

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Jalankan verifikasi sesi Token JWT ke API Backend saat aplikasi pertama dimuat
    checkAuth();
  }, [checkAuth]);

  return (
    // Membungkus seluruh aplikasi agar semua komponen bisa menggunakan useQuery (Caching)
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}