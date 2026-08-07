// apps/web/src/routes/guards/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
    const { isAuthenticated, isHydrating } = useAuthStore();
    const location = useLocation(); // Menyimpan URL yang sedang dicoba diakses user

    // 1. Kondisi Hydrating: Aplikasi masih mengecek Token JWT ke server
    // Mencegah "Flicker Screen" (Layar berkedip dari Dashboard terlempar ke Login)
    if (isHydrating) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
                <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
                <p className="text-xs font-black tracking-[0.2em] uppercase animate-pulse">
                    Memverifikasi Sesi...
                </p>
            </div>
        );
    }

    // 2. Kondisi Ditolak: Tidak punya token / Sesi habis
    if (!isAuthenticated) {
        // Arahkan ke login, dan bawa 'state' lokasi sebelumnya (agar setelah login sukses, dikembalikan ke URL tadi)
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Lolos Pemeriksaan: Lanjutkan merender halaman yang dituju
    return <Outlet />;
}