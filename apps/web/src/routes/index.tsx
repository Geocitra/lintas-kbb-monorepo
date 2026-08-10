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

// 2. Import Pages secara Lazy
// Public & Auth
const Landing    = lazy(() => import('@/pages/public/Landing'));
const Lapor      = lazy(() => import('@/pages/public/Lapor'));
const Track      = lazy(() => import('@/pages/public/Track'));
const Login      = lazy(() => import('@/pages/auth/Login'));

// Shared (semua role yang sudah login)
const Pengumuman = lazy(() => import('@/pages/shared/Pengumuman'));

// KADIS — Executive Dashboard
const KadisDashboard = lazy(() => import('@/pages/kadis/KadisDashboard'));

// Admin Core
const Dashboard  = lazy(() => import('@/pages/admin/Dashboard'));
const GisCommandCenter = lazy(() => import('@/pages/admin/GisCommandCenter'));

// Admin Assets & Audit (FASE 4)
const AssetList  = lazy(() => import('@/pages/admin/assets/AssetList'));
const AssetForm  = lazy(() => import('@/pages/admin/assets/AssetForm'));
const AssetBulk  = lazy(() => import('@/pages/admin/assets/AssetBulk'));
const AuditTrail = lazy(() => import('@/pages/admin/AuditTrail'));

// Admin Users
const UserList   = lazy(() => import('@/pages/admin/users/UserList'));

// Admin Ticketing & Triage (FASE 5)
const ReportList   = lazy(() => import('@/pages/admin/reports/ReportList'));
const TicketList   = lazy(() => import('@/pages/admin/tickets/TicketList'));
const TicketReview = lazy(() => import('@/pages/admin/tickets/TicketReview'));

// Master Data & Assignments
const MasterData     = lazy(() => import('@/pages/admin/master/MasterData'));
const AssignmentList = lazy(() => import('@/pages/admin/assignments/AssignmentList'));
// Technician Execution (FASE 5)
const MyTasks    = lazy(() => import('@/pages/technician/MyTasks'));
const ExecuteTask = lazy(() => import('@/pages/technician/ExecuteTask'));

// Pengumuman Management (FASE 6)
const AnnouncementForm = lazy(() => import('@/pages/admin/broadcast/AnnouncementForm'));

// Errors
const NotFound   = lazy(() => import('@/pages/errors/NotFound'));

// Komponen Loader Transisi
const SuspenseLoader = () => (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
        <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Memuat Modul...</span>
    </div>
);

const S = (Page: React.ComponentType) => (
    <Suspense fallback={<SuspenseLoader />}><Page /></Suspense>
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
                    { path: '/',      element: S(Landing) },
                    { path: '/lapor', element: S(Lapor) },
                    { path: '/track', element: S(Track) },
                ]
            },

            // ==========================================
            // ZONA GUEST (Portal Login)
            // ==========================================
            {
                element: <GuestRoute />,
                children: [
                    { path: '/login', element: S(Login) }
                ]
            },

            // ==========================================
            // ZONA BACK-OFFICE (Wajib Login)
            // ==========================================
            {
                element: <ProtectedRoute />,
                children: [
                    // LAYOUT: STANDARD APP (Sidebar)
                    {
                        element: <AppLayout />,
                        children: [

                            // ------------------------------------------
                            // SEMUA ROLE YANG SUDAH LOGIN
                            // ------------------------------------------
                            {
                                element: <RoleRoute allowedRoles={['KADIS', 'ADMIN', 'KASI', 'TEKNISI', 'MASYARAKAT']} />,
                                children: [
                                    { path: '/pengumuman', element: S(Pengumuman) },
                                ]
                            },

                            // ------------------------------------------
                            // KHUSUS KEPALA DINAS (Executive View)
                            // ------------------------------------------
                            {
                                element: <RoleRoute allowedRoles={['KADIS']} />,
                                children: [
                                    { path: '/dashboard', element: S(KadisDashboard) },
                                ]
                            },

                            // ------------------------------------------
                            // HANYA UNTUK ADMIN PUSAT
                            // ------------------------------------------
                            {
                                element: <RoleRoute allowedRoles={['ADMIN']} />,
                                children: [
                                    { path: '/admin-dashboard', element: S(Dashboard) },
                                    { path: '/assets', element: S(AssetList) },
                                    { path: '/assets/create', element: S(AssetForm) },
                                    { path: '/assets/:id/edit', element: S(AssetForm) },
                                    { path: '/assets/bulk', element: S(AssetBulk) },
                                    { path: '/audit', element: S(AuditTrail) },
                                    { path: '/admin/users', element: S(UserList) },
                                    { path: '/admin/master', element: S(MasterData) },
                                    { path: '/admin/assignments', element: S(AssignmentList) },
                                ]
                            },

                            // ------------------------------------------
                            // KADIS + ADMIN (Pengumuman Management)
                            // ------------------------------------------
                            {
                                element: <RoleRoute allowedRoles={['KADIS', 'ADMIN']} />,
                                children: [
                                    { path: '/pengumuman/create', element: S(AnnouncementForm) },
                                ]
                            },

                            // ------------------------------------------
                            // KHUSUS KASI (Supervisor/Triage/QC)
                            // ------------------------------------------
                            {
                                element: <RoleRoute allowedRoles={['KASI']} />,
                                children: [
                                    { path: '/reports',  element: S(ReportList) },
                                    { path: '/tickets',  element: S(TicketList) },
                                    { path: '/tickets/:id/review', element: S(TicketReview) },
                                ]
                            },

                            // ------------------------------------------
                            {
                                element: <RoleRoute allowedRoles={['TEKNISI']} />,
                                children: [
                                    { path: '/my-tasks', element: S(MyTasks) },
                                    { path: '/my-tasks/:id/execute', element: S(ExecuteTask) },
                                    // Sensus Lapangan (moved to GisLayout)
                                ]
                            },
                        ]
                    },

                    // LAYOUT: GIS FULL SCREEN
                    {
                        element: <GisLayout />,
                        children: [
                            {
                                element: <RoleRoute allowedRoles={['KADIS', 'ADMIN', 'KASI']} />,
                                children: [
                                    { path: '/gis', element: S(GisCommandCenter) }
                                ]
                            },
                            {
                                element: <RoleRoute allowedRoles={['TEKNISI']} />,
                                children: [
                                    { path: '/field-census', element: S(GisCommandCenter) }
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