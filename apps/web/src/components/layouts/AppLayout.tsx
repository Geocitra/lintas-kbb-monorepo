// apps/web/src/components/layouts/AppLayout.tsx
import { useState, type ReactNode } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import {
    LayoutDashboard, Map, FileText, ClipboardList,
    ShieldCheck, LogOut, Menu, X,
    CheckSquare, Users, BarChart2, Hammer, Bell,
    Database, ArrowRightLeft
} from 'lucide-react';
import type { Role } from '@dishub/types';
import NotificationBell from '@/components/ui/NotificationBell';

interface NavItem {
    name: string;
    path: string;
    icon: ReactNode;
    allowedRoles: Role[];
    matchPath?: string;
}

export default function AppLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems: NavItem[] = [
        // === KEPALA DINAS (Executive) ===
        { name: 'Ruang Komando', path: '/dashboard', icon: <BarChart2 size={18} />, allowedRoles: ['KADIS'] },
        { name: 'Peta Wilayah', path: '/gis', icon: <Map size={18} />, allowedRoles: ['KADIS'] },
        { name: 'Pengumuman', path: '/pengumuman', icon: <Bell size={18} />, allowedRoles: ['KADIS'] },

        // === ADMIN SISTEM ===
        { name: 'Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard size={18} />, allowedRoles: ['ADMIN'] },
        { name: 'Peta Spasial', path: '/gis', icon: <Map size={18} />, allowedRoles: ['ADMIN'] },
        { name: 'Inventaris Aset', path: '/assets', icon: <FileText size={18} />, allowedRoles: ['ADMIN'] },
        { name: 'Peminjaman Aset', path: '/admin/assignments', icon: <ArrowRightLeft size={18} />, allowedRoles: ['ADMIN'] },
        { name: 'Pengumuman', path: '/pengumuman', icon: <Bell size={18} />, allowedRoles: ['ADMIN'] },
        { name: 'Manajemen User', path: '/admin/users', icon: <Users size={18} />, allowedRoles: ['ADMIN'] },
        { name: 'Data Master', path: '/admin/master', icon: <Database size={18} />, allowedRoles: ['ADMIN'] },
        { name: 'Audit Trail', path: '/audit', icon: <ShieldCheck size={18} />, allowedRoles: ['ADMIN'] },

        // === KEPALA SEKSI (Supervisor) ===
        { name: 'Peta Spasial', path: '/gis', icon: <Map size={18} />, allowedRoles: ['KASI'] },
        { name: 'Aduan Masuk', path: '/reports', icon: <ClipboardList size={18} />, allowedRoles: ['KASI'] },
        { name: 'Tiket Perbaikan', path: '/tickets', icon: <CheckSquare size={18} />, allowedRoles: ['KASI'] },
        // { name: 'Tugas Saya',      path: '/my-tasks',     icon: <Hammer size={18} />,        allowedRoles: ['KASI'] },
        // { name: 'Sensus Lapangan', path: '/field-census', icon: <Map size={18} />,           allowedRoles: ['KASI'] },
        { name: 'Pengumuman', path: '/pengumuman', icon: <Bell size={18} />, allowedRoles: ['KASI'] },

        // === TEKNISI (Petugas Lapangan) ===
        { name: 'Tugas Saya', path: '/my-tasks', icon: <Hammer size={18} />, allowedRoles: ['TEKNISI'] },
        { name: 'Sensus Lapangan', path: '/field-census', icon: <Map size={18} />, allowedRoles: ['TEKNISI'] },
        { name: 'Pengumuman', path: '/pengumuman', icon: <Bell size={18} />, allowedRoles: ['TEKNISI'] },
    ];

    const filteredNavItems = navItems.filter(item =>
        user && item.allowedRoles.includes(user.role)
    );

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-800">


            {/* === SIDEBAR === */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* LOGO */}
                <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5 shrink-0">
                    <img src="/Logo_Dishub.png" alt="Logo Dishub" className="w-9 h-9 object-contain" />
                    <div className="flex flex-col leading-none">
                        <span className="text-base font-black tracking-tight text-white uppercase">
                            LIN<span className="text-blue-400">TAS</span>
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">
                            Dishub
                        </span>
                    </div>
                    <button className="md:hidden ml-auto text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                {/* ROLE BADGE */}
                <div className="px-5 py-3 border-b border-white/5 shrink-0">
                    <span className="inline-block px-2 py-0.5 bg-blue-600/20 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-600/30">
                        {user?.role?.replace('_', ' ')}
                    </span>
                </div>

                {/* NAV */}
                <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 custom-scrollbar">
                    {filteredNavItems.map((item, idx) => {
                        const activePath = item.matchPath || item.path;
                        const isActive = location.pathname === activePath ||
                            (activePath !== '/' && location.pathname.startsWith(activePath));
                        return (
                            <Link
                                key={`${item.path}-${idx}`}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 transition-all font-semibold text-xs tracking-wide
                                    ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* PROFIL */}
                <div className="p-3 border-t border-white/5 shrink-0">
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-white/5 mb-2">
                        <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-xs font-black uppercase text-white shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold truncate text-white">{user?.name}</span>
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-0.5">{user?.role?.replace('_', ' ')}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-rose-400 hover:bg-rose-500/10 transition-colors font-bold text-xs"
                    >
                        <LogOut size={16} />
                        Keluar Sistem
                    </button>
                </div>
            </aside>

            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* === KONTEN UTAMA === */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0">

                {/* TOPBAR */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-blue-600" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <div className="hidden sm:flex items-center gap-2">
                            <img src="/Logo_Dishub.png" alt="Logo" className="w-6 h-6 object-contain" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">
                                Dinas Perhubungan
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-700 tracking-widest uppercase">Online</span>
                        </div>
                    </div>
                </header>

                {/* KONTEN */}
                <main className="flex-1 min-h-0 overflow-y-auto bg-slate-50 p-6 md:p-8 custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}