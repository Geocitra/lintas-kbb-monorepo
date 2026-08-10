// apps/web/src/components/layouts/PublicLayout.tsx
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Activity, LogIn, Home } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function PublicLayout() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { isAuthenticated, user } = useAuthStore();

    // Efek transparan/solid navbar saat di-scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Tutup menu mobile setiap kali pindah halaman
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { name: 'Beranda', path: '/', icon: <Home size={16} /> },
        { name: 'Lapor Kerusakan', path: '/lapor', icon: <MapPin size={16} /> },
        { name: 'Lacak Tiket', path: '/track', icon: <Activity size={16} /> },
    ];

    return (
        <div className="h-screen w-screen overflow-y-auto bg-slate-50 flex flex-col font-sans selection:bg-blue-200 custom-scrollbar">
            {/* ================= NAVBAR ================= */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-white py-5 border-b border-slate-200'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src="/Logo_Dishub.png"
                            alt="Logo Dishub"
                            className="w-9 h-9 object-contain"
                        />
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter leading-none text-slate-900">
                                LIN<span className="text-blue-600">TAS.</span>
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                                DISHUB
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <ul className="flex items-center gap-6">
                            {navLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors hover:text-blue-600 ${location.pathname === link.path ? 'text-blue-600' : 'text-slate-500'
                                            }`}
                                    >
                                        {link.icon} {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="h-6 w-px bg-slate-200"></div>

                        {isAuthenticated ? (
                            <Link
                                to={(() => {
                                    if (user?.role === 'ADMIN') return '/admin-dashboard';
                                    if (user?.role === 'KADIS') return '/dashboard';
                                    if (user?.role === 'KASI') return '/reports';
                                    if (user?.role === 'TEKNISI') return '/my-tasks';
                                    return '/pengumuman';
                                })()}
                                className="px-6 py-2.5 bg-slate-900 text-white hover:bg-blue-600 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-slate-200 hover:-translate-y-0.5"
                            >
                                Ke Dashboard
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-full text-xs font-black uppercase tracking-widest transition-all border border-blue-100 hover:border-blue-600"
                            >
                                <LogIn size={14} /> Portal Pegawai
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Dropdown */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl p-4 md:hidden flex flex-col gap-2 animate-in slide-in-from-top-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 p-4 rounded-xl text-xs font-bold uppercase tracking-widest ${location.pathname === link.path ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {link.icon} {link.name}
                            </Link>
                        ))}
                        <div className="my-2 border-t border-slate-100"></div>
                        <Link
                            to={isAuthenticated ? (() => {
                                if (user?.role === 'ADMIN') return '/admin-dashboard';
                                if (user?.role === 'KADIS') return '/dashboard';
                                if (user?.role === 'KASI') return '/reports';
                                if (user?.role === 'TEKNISI') return '/my-tasks';
                                return '/pengumuman';
                            })() : '/login'}
                            className="flex items-center justify-center gap-2 p-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest"
                        >
                            {isAuthenticated ? 'Ke Dashboard' : 'Portal Pegawai'}
                        </Link>
                    </div>
                )}
            </nav>

            {/* ================= MAIN CONTENT ================= */}
            <main className="flex-1 pt-20">
                {/* Konten Halaman Spesifik (Landing, Lapor, Track) akan dimuat di sini */}
                <Outlet />
            </main>

            {/* ================= FOOTER ================= */}
            <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                            <MapPin className="text-slate-300" size={24} />
                        </div>
                        <div>
                            <h4 className="text-white font-black text-lg tracking-tighter">LINTAS</h4>
                            <p className="text-[10px] uppercase tracking-widest font-bold mt-1">Dinas Perhubungan</p>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-xs font-medium mb-1">Jl. Kantor Dinas Perhubungan</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">&copy; {new Date().getFullYear()} Hak Cipta Dilindungi.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}