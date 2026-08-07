// apps/web/src/routes/guards/RoleRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import type { Role } from '@dishub/types';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface RoleRouteProps {
    allowedRoles: Role[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
    const { user, isAuthenticated, isHydrating } = useAuthStore();

    if (isHydrating) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50">
                <Loader2 size={30} className="animate-spin text-blue-600" />
            </div>
        );
    }

    // Jika belum login sama sekali, lempar ke login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // SOCIO-ENGINEERING GUARD: Mencegah eskalasi hak akses di sisi Frontend
    if (!allowedRoles.includes(user.role)) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center bg-slate-50">
                <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <ShieldAlert size={48} className="text-rose-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3 uppercase">
                    Akses Ditolak
                </h1>
                <p className="text-sm text-slate-500 font-medium max-w-md leading-relaxed">
                    Maaf, Anda tidak memiliki wewenang administratif untuk membuka halaman ini. Area ini dikhususkan bagi pengguna dengan level otorisasi tertentu.
                </p>
            </div>
        );
    }

    // Jika Role cocok, render halaman tujuan
    return <Outlet />;
}