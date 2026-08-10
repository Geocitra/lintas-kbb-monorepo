// apps/web/src/components/layouts/GisLayout.tsx
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useGisUIStore, type PanelType } from '@/store/useGisUIStore';
import { MapPin, LogOut, Home, FolderGit, AlertTriangle, Settings, Info } from 'lucide-react';

export default function GisLayout() {
    const { user, logout } = useAuthStore();
    const { activePanels, openPanel, closePanelsToTheRight } = useGisUIStore();

    // Helper untuk mengecek apakah sebuah panel sedang terbuka
    const isPanelActive = (type: PanelType) => activePanels.some(p => p.type === type);
    // Navigasi Sidebar Peta
    const sidebarNav = [
        { type: 'katalog-aset' as PanelType, icon: <FolderGit size={20} />, label: 'Katalog Aset' },
        ...((user?.role && ['KADIS', 'KASI'].includes(user.role)) ? [
            { type: 'katalog-laporan' as PanelType, icon: <AlertTriangle size={20} />, label: 'Aduan Masuk' }
        ] : []),
        { type: 'konfigurasi' as PanelType, icon: <Settings size={20} />, label: 'Konfigurasi' },
    ];

    const handleNavClick = (type: PanelType, title: string) => {
        closePanelsToTheRight(-1); // Tutup semua panel yang ada
        openPanel(type, title);    // Buka panel yang diminta
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 font-sans text-slate-800">

            {/* ================= TOP NAVBAR (Z-50) ================= */}
            <header className="h-14 bg-slate-900 border-b border-white/10 flex items-center justify-between px-4 z-50 shrink-0 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
                        <MapPin size={18} className="text-white" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-sm font-black tracking-tighter uppercase">
                            LINTAS
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                            Command Center GIS
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">PostGIS Sinkron</span>
                    </div>
                    <div className="h-6 w-px bg-white/10"></div>

                    <div className="flex items-center gap-2 text-right">
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold uppercase truncate max-w-[100px]">{user?.name}</span>
                            <span className="text-[8px] font-black text-blue-400 tracking-widest uppercase mt-0.5">{user?.role}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ================= BODY AREA ================= */}
            <div className="flex-1 flex w-full relative overflow-hidden">

                {/* SIDEBAR MINI (Z-40) */}
                <aside className="w-16 bg-white border-r border-slate-200 z-40 flex flex-col items-center py-4 shrink-0 shadow-xl">

                    <div className="flex flex-col gap-2 w-full px-2">
                        <Link
                            to={(() => {
                                if (user?.role === 'ADMIN') return '/admin-dashboard';
                                if (user?.role === 'KADIS') return '/dashboard';
                                if (user?.role === 'KASI') return '/reports';
                                if (user?.role === 'TEKNISI') return '/my-tasks';
                                return '/';
                            })()}
                            className="w-full aspect-square flex flex-col items-center justify-center gap-1 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Kembali ke Dashboard"
                        >
                            <Home size={20} />
                        </Link>

                        <div className="w-8 h-px bg-slate-200 mx-auto my-1"></div>

                        {/* Menu Panel GIS */}
                        {sidebarNav.map((item) => {
                            const active = isPanelActive(item.type);
                            return (
                                <button
                                    key={item.type}
                                    onClick={() => handleNavClick(item.type, item.label)}
                                    className={`w-full aspect-square flex flex-col items-center justify-center rounded-xl transition-all outline-none
                    ${active ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-50'}`}
                                    title={item.label}
                                >
                                    {item.icon}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-auto flex flex-col gap-2 w-full px-2">
                        <button
                            onClick={() => handleNavClick('tentang', 'Tentang LINTAS')}
                            className={`w-full aspect-square flex items-center justify-center rounded-xl transition-colors
                ${isPanelActive('tentang') ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-50'}`}
                            title="Informasi Sistem"
                        >
                            <Info size={20} />
                        </button>
                        <button
                            onClick={() => { logout(); window.location.href = '/login'; }}
                            className="w-full aspect-square flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Keluar"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </aside>

                {/* AREA PETA UTAMA (Outlet) */}
                <main className="flex-1 relative z-0 bg-slate-900">
                    <Outlet />
                </main>

            </div>
        </div>
    );
}