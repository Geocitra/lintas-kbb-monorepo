// apps/web/src/routes/guards/GuestRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function GuestRoute() {
    const { isAuthenticated, isHydrating, user } = useAuthStore();
    const location = useLocation();

    // 1. Tahan render saat status login sedang dicek
    if (isHydrating) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
                <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
                <p className="text-xs font-black tracking-[0.2em] uppercase animate-pulse">
                    Memeriksa Status Sesi...
                </p>
            </div>
        );
    }

    // 2. Jika SUDAH login, tendang dari halaman ini (misal: /login)
    if (isAuthenticated && user) {
        // Jika ada history URL sebelumnya, kembalikan ke sana. Jika tidak, arahkan berdasarkan Role.
        let defaultRoute = '/pengumuman';
        if (user.role === 'TEKNISI') defaultRoute = '/my-tasks';
        else if (user.role === 'ADMIN') defaultRoute = '/admin-dashboard';
        else if (user.role === 'KADIS') defaultRoute = '/dashboard';
        else if (user.role === 'KASI') defaultRoute = '/reports';

        const from = location.state?.from?.pathname || defaultRoute;

        return <Navigate to={from} replace />;
    }

    // 3. Jika BELUM login (Guest asli), izinkan merender halaman (seperti Form Login)
    return <Outlet />;
}