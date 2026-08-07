// apps/web/src/routes/index.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// 1. Import Layouts & Guards
import RootLayout from '@/components/layouts/RootLayout';
import AppLayout from '@/components/layouts/AppLayout';
import PublicLayout from '@/components/layouts/PublicLayout'; // IMPORT PUBLIC LAYOUT
import ProtectedRoute from './guards/ProtectedRoute';
import GuestRoute from './guards/GuestRoute';
import RoleRoute from './guards/RoleRoute';

// 2. Import Pages secara Lazy
const Landing = lazy(() => import('@/pages/public/Landing'));
const Lapor = lazy(() => import('@/pages/public/Lapor'));
const Track = lazy(() => import('@/pages/public/Track')); // IMPORT TRACK PAGE
const Login = lazy(() => import('@/pages/auth/Login'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const NotFound = lazy(() => import('@/pages/errors/NotFound'));

// Loader
const SuspenseLoader = () => (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 text-slate-400">
        <Loader2 size={32} className="animate-spin text-blue-600 mb-4" />
        <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Memuat Modul...</span>
    </div>
);

// 3. Merakit Pohon Navigasi
export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        errorElement: <NotFound />,
        children: [

            // ==========================================
            // ZONA PUBLIK (Dibungkus dengan PublicLayout - Navbar/Footer)
            // ==========================================
            {
                element: <PublicLayout />,
                children: [
                    { path: '/', element: <Suspense fallback={<SuspenseLoader />}><Landing /></Suspense> },
                    { path: '/lapor', element: <Suspense fallback={<SuspenseLoader />}><Lapor /></Suspense> },
                    { path: '/track', element: <Suspense fallback={<SuspenseLoader />}><Track /></Suspense> },
                ]
            },

            // ==========================================
            // ZONA GUEST (Portal Login)
            // ==========================================
            {
                element: <GuestRoute />,
                children: [
                    { path: '/login', element: <Suspense fallback={<SuspenseLoader />}><Login /></Suspense> }
                ]
            },

            // ==========================================
            // ZONA BACK-OFFICE (Admin & Pegawai)
            // ==========================================
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <AppLayout />,
                        children: [
                            {
                                element: <RoleRoute allowedRoles={['KADIS', 'ADMIN']} />,
                                children: [
                                    { path: '/dashboard', element: <Suspense fallback={<SuspenseLoader />}><Dashboard /></Suspense> }
                                ]
                            },
                        ]
                    }
                ]
            },

            // 404
            { path: '*', element: <NotFound /> }
        ]
    }
]);