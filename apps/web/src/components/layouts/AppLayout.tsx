// apps/web/src/components/layouts/AppLayout.tsx
import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import {
    LayoutDashboard, Map, FileText, ClipboardList,
    Settings, LogOut, Menu, X
} from 'lucide-react';

export default function AppLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation(); // Untuk mendeteksi menu mana yang sedang aktif

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Navigasi Dinamis (Nantinya bisa difilter berdasarkan Role)
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Peta Spasial', path: '/gis', icon: <Map size={18} /> },
        { name: 'Data Aset', path: '/assets', icon: <FileText size={18} /> },
        { name: 'Tiket Perbaikan', path: '/tickets', icon: <ClipboardList size={18} /> },
        { name: 'Sistem Admin', path: '/admin/users', icon: <Settings size={18} /> },
    ];

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800">

            {/* 1. SIDEBAR (Kiri) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tighter leading-none uppercase">
                            LINTAS <span className="text-blue-500">KBB</span>
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                            Command Center
                        </span>
                    </div>
                    <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)} // Tutup sidebar di HP saat diklik
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs tracking-wide ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-black uppercase">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold truncate">{user?.name}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{user?.role}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-bold text-xs"
                    >
                        <LogOut size={18} />
                        Keluar Sistem
                    </button>
                </div>
            </aside>

            {/* OVERLAY UNTUK MOBILE (Menggelapkan layar belakang saat sidebar terbuka) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* 2. KONTEN UTAMA (Kanan) */}
            <div className="flex-1 flex flex-col h-full min-w-0">

                {/* TOPBAR / NAVBAR */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-blue-600" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <h2 className="hidden sm:block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                            Sistem Manajemen Aset Terpadu
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-emerald-700 tracking-widest uppercase">Sistem Online</span>
                        </div>
                    </div>
                </header>

                {/* AREA KONTEN (Di sinilah halaman seperti Dashboard / Tabel Aset dirender) */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 custom-scrollbar relative">
                    <Outlet />
                </main>
            </div>

        </div>
    );
}