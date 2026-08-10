// apps/web/src/pages/auth/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { UserLoginSchema, type UserLoginDTO } from '@dishub/types';
import { useAuthStore } from '@/store/useAuthStore';

// Fungsi untuk menentukan halaman awal setelah login berdasarkan role
function getRedirectPath(role: string): string {
    switch (role) {
        case 'KADIS':       return '/dashboard';
        case 'ADMIN':       return '/admin-dashboard';
        case 'KASI':        return '/reports';
        case 'TEKNISI':     return '/my-tasks';
        case 'MASYARAKAT':  return '/pengumuman';
        default:            return '/pengumuman';
    }
}

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserLoginDTO>({
        resolver: zodResolver(UserLoginSchema) as any,
    });

    const onSubmit = async (data: UserLoginDTO) => {
        setApiError(null);
        try {
            await login(data);
            const { user } = useAuthStore.getState();
            navigate(getRedirectPath(user?.role || ''), { replace: true });
        } catch (err: any) {
            setApiError(
                err?.response?.data?.message || 'Autentikasi gagal. Periksa kembali NIP/Email dan Password.'
            );
        }
    };

    return (
        <div className="h-screen w-screen overflow-y-auto bg-slate-950 custom-scrollbar flex">
            {/* === PANEL KIRI — HERO === */}
            <div
                className="hidden lg:flex flex-1 relative flex-col justify-between p-12 overflow-hidden"
                style={{
                    backgroundImage: `url('/bg-hero.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Overlay gelap agar teks terbaca */}
                <div className="absolute inset-0 bg-slate-950/70 z-0" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <img src="/Logo_Dishub.png" alt="Logo Dishub" className="w-12 h-12 object-contain" />
                        <div>
                            <div className="text-2xl font-black text-white tracking-tight uppercase">
                                LIN<span className="text-blue-400">TAS</span>
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                Dishub
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                        Portal Internal
                    </div>
                    <h1 className="text-4xl font-black text-white leading-tight uppercase tracking-tight">
                        Sistem Informasi<br />
                        <span className="text-blue-400">Infrastruktur</span><br />
                        Terpadu
                    </h1>
                    <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                        Pantau, kelola, dan koordinasikan aset infrastruktur jalan secara real-time dari satu platform terpadu.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <span>GIS Command Center</span>
                    <span className="w-1 h-1 bg-slate-600"></span>
                    <span>Ticketing System</span>
                    <span className="w-1 h-1 bg-slate-600"></span>
                    <span>Asset Management</span>
                </div>
            </div>

            {/* === PANEL KANAN — FORM LOGIN === */}
            <div className="w-full lg:w-[420px] flex flex-col items-center justify-center p-8 bg-slate-950 border-l border-white/5">
                {/* Mobile Logo */}
                <div className="flex lg:hidden items-center gap-3 mb-8">
                    <img src="/Logo_Dishub.png" alt="Logo" className="w-10 h-10 object-contain" />
                    <div className="text-xl font-black text-white tracking-tight uppercase">
                        LIN<span className="text-blue-400">TAS</span>
                    </div>
                </div>

                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Login Portal</h2>
                        <p className="text-slate-500 text-xs mt-1">
                            Otentikasi NIP atau Email untuk Pegawai Dishub
                        </p>
                    </div>

                    {/* Error API */}
                    {apiError && (
                        <div className="mb-6 p-4 bg-rose-900/30 border border-rose-700/50 border-l-4 border-l-rose-500 flex items-start gap-3">
                            <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={16} />
                            <p className="text-xs font-bold text-rose-300 leading-relaxed">{apiError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Identifier */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                NIP / Email
                            </label>
                            <input
                                type="text"
                                placeholder="Masukkan NIP atau Email"
                                disabled={isSubmitting}
                                {...register('identifier')}
                                className={`w-full bg-slate-900 border text-sm font-medium text-white placeholder-slate-600 px-4 py-3 outline-none transition-all
                                    ${errors.identifier
                                        ? 'border-rose-500 focus:border-rose-400'
                                        : 'border-slate-700 focus:border-blue-500'
                                    }`}
                            />
                            {errors.identifier && (
                                <p className="text-[10px] font-bold text-rose-400">{errors.identifier.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukkan Password"
                                    disabled={isSubmitting}
                                    {...register('password')}
                                    className={`w-full bg-slate-900 border text-sm font-medium text-white placeholder-slate-600 pl-4 pr-12 py-3 outline-none transition-all
                                        ${errors.password
                                            ? 'border-rose-500 focus:border-rose-400'
                                            : 'border-slate-700 focus:border-blue-500'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[10px] font-bold text-rose-400">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[11px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <><Loader2 size={16} className="animate-spin" /> Sedang Otentikasi...</>
                            ) : (
                                'Masuk ke Sistem'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                        <Link to="/" className="text-slate-500 hover:text-blue-400 text-[10px] font-black uppercase tracking-widest transition-colors">
                            ← Portal Publik
                        </Link>
                        <span className="text-[9px] text-slate-700 uppercase tracking-widest">v2.0 LINTAS</span>
                    </div>
                </div>
            </div>
        </div>
    );
}