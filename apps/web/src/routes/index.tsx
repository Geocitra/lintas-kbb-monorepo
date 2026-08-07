// apps/web/src/routes/index.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// 1. Import Layouts & Guards
import RootLayout from '@/components/layouts/RootLayout';
import AppLayout from '@/components/layouts/AppLayout';
import PublicLayout from '@/components/layouts/PublicLayout';
import GisLayout from '@/components/layouts/GisLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import GuestRoute from './guards/GuestRoute';
import RoleRoute from './guards/RoleRoute';

// 2. Import Pages secara Lazy (Hanya di-download saat halaman dikunjungi)
// Public & Auth
const Landing = lazy(() => import('@/pages/public/Landing'));
const Lapor = lazy(() => import('@/pages/public/Lapor'));
const Track = lazy(() => import('@/pages/public/Track'));
const Login = lazy(() => import('@/pages/auth/Login'));

// Admin Core
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const GisCommandCenter = lazy(() => import('@/pages/admin/GisCommandCenter'));

// Admin Assets & Audit (FASE 4)
const AssetList = lazy(() => import('@/pages/admin/assets/AssetList'));
const AssetForm = lazy(() => import('@/pages/admin/assets/AssetForm'));
const AssetBulk = lazy(() => import('@/pages/admin/assets/AssetBulk'));
const AuditTrail = lazy(() => import('@/pages/admin/AuditTrail'));

// Admin Ticketing & Triage (FASE 5)
const ReportList = lazy(() => import('@/pages/admin/reports/ReportList'));
const TicketList = lazy(() => import('@/pages/admin/tickets/TicketList'));
const TicketReview = lazy(() => import('@/pages/admin/tickets/TicketReview'));

// Technician Execution (FASE 5)
const MyTasks = lazy(() => import('@/pages/technician/MyTasks'));
const ExecuteTask = lazy(() => import('@/pages/technician/ExecuteTask'));

const AnnouncementList = lazy(() => import('@/pages/admin/broadcast/AnnouncementList'));
const AnnouncementForm = lazy(() => import('@/pages/admin/broadcast/AnnouncementForm'));

// Errors
const NotFound = lazy(() => import('@/pages/errors/NotFound'));

// Komponen Loader Transisi
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
            // ZONA PUBLIK
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
            // ZONA BACK-OFFICE (Wajib Login)
            // ==========================================
            {
                element: <ProtectedRoute />,
                children: [
                    // LAYOUT 1: ADMIN STANDAR (Dengan Sidebar Teks)
                    {
                        element: <AppLayout />,
                        children: [
                            // ------------------------------------------
                            // HANYA UNTUK KADIS & ADMIN PUSAT
                            // ------------------------------------------
                            {
                                element: <RoleRoute allowedRoles={['KADIS', 'ADMIN']} />,
                                children: [
                                    { path: '/dashboard', element: <Suspense fallback={<SuspenseLoader />}><Dashboard /></Suspense> },

                                    // Aset
                                    { path: '/assets', element: <Suspense fallback={<SuspenseLoader />}><AssetList /></Suspense> },
                                    { path: '/assets/create', element: <Suspense fallback={<SuspenseLoader />}><AssetForm /></Suspense> },
                                    { path: '/assets/:id/edit', element: <Suspense fallback={<SuspenseLoader />}><AssetForm /></Suspense> },
                                    { path: '/assets/bulk', element: <Suspense fallback={<SuspenseLoader />}><AssetBulk /></Suspense> },

                                    // Audit (Sistem Admin)
                                    { path: '/audit', element: <Suspense fallback={<SuspenseLoader />}><AuditTrail /></Suspense> },

                                    // Broadcast & Pengumuman (FASE 6)
                                    { path: '/broadcast', element: <Suspense fallback={<SuspenseLoader />}><AnnouncementList /></Suspense> },
                                    { path: '/broadcast/create', element: <Suspense fallback={<SuspenseLoader />}><AnnouncementForm /></Suspense> },
                                ]
                            },

                            // ------------------------------------------
                            // BISA DIAKSES ADMIN & KASI (Supervisor)
                            // ------------------------------------------
                            {
                                element: <RoleRoute allowedRoles={['KADIS', 'ADMIN', 'KASI']} />,
                                children: [
                                    { path: '/reports', element: <Suspense fallback={<SuspenseLoader />}><ReportList /></Suspense> },
                                    { path: '/tickets', element: <Suspense fallback={<SuspenseLoader />}><TicketList /></Suspense> },
                                    { path: '/tickets/:id/review', element: <Suspense fallback={<SuspenseLoader />}><TicketReview /></Suspense> },
                                ]
                            },

                            // ------------------------------------------
                            // KHUSUS PETUGAS LAPANGAN (TEKNISI & KASI)
                            // ------------------------------------------
                            {
                                element: <RoleRoute allowedRoles={['TEKNISI', 'KASI']} />,
                                children: [
                                    { path: '/my-tasks', element: <Suspense fallback={<SuspenseLoader />}><MyTasks /></Suspense> },
                                    { path: '/my-tasks/:id/execute', element: <Suspense fallback={<SuspenseLoader />}><ExecuteTask /></Suspense> },
                                ]
                            },
                        ]
                    },

                    // LAYOUT 2: GIS COMMAND CENTER (Full Screen dengan Sidebar Mini)
                    {
                        element: <GisLayout />,
                        children: [
                            {
                                element: <RoleRoute allowedRoles={['KADIS', 'ADMIN', 'KASI']} />,
                                children: [
                                    { path: '/gis', element: <Suspense fallback={<SuspenseLoader />}><GisCommandCenter /></Suspense> }
                                ]
                            }
                        ]
                    }
                ]
            },

            // 404
            { path: '*', element: <NotFound /> }
        ]
    }
]);