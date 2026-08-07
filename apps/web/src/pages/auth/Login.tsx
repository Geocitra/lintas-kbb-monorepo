// apps/web/src/pages/auth/Login.tsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { UserLoginSchema, type UserLoginDTO } from '@dishub/types';
import { useAuthStore } from '@/store/useAuthStore';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const login = useAuthStore((state) => state.login);
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // Inisialisasi React Hook Form + Zod Validator
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<UserLoginDTO>({
        resolver: zodResolver(UserLoginSchema),
    });

    const onSubmit = async (data: UserLoginDTO) => {
        setApiError(null);
        try {
            await login(data);
            // Jika berhasil, arahkan ke halaman sebelumnya atau dashboard
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (error: any) {
            // Menangkap error dari Axios Interceptor
            setApiError(error.message || 'Gagal terhubung ke server.');
        }
    };

    return (
        <div className="h-screen w-screen overflow-y-auto bg-slate-900 custom-scrollbar flex flex-col">
            <div className="min-h-full flex flex-col items-center justify-center p-6 text-white relative overflow-hidden font-sans">
                {/* Background Ornaments */}
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="w-full max-w-md bg-white text-slate-800 p-8 md:p-10 rounded-[2rem] shadow-2xl relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black mb-1 uppercase tracking-tight text-slate-900">Login Portal</h1>
                        <p className="text-slate-500 text-xs font-medium">
                            Otentikasi NIP/Email untuk Pegawai Dishub KBB.
                        </p>
                    </div>

                    {/* Notifikasi Error API */}
                    {apiError && (
                        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={16} />
                            <p className="text-xs font-bold text-rose-700 leading-relaxed">{apiError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Input Identifier (NIP/Email) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Username / NIP / Email
                            </label>
                            <input
                                type="text"
                                placeholder="Masukkan NIP atau Email"
                                disabled={isSubmitting}
                                {...register('identifier')}
                                className={`w-full bg-slate-50 border-2 rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all text-slate-800 ${errors.identifier ? 'border-rose-400 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-blue-500 focus:bg-white'
                                    }`}
                            />
                            {errors.identifier && (
                                <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.identifier.message}</p>
                            )}
                        </div>

                        {/* Input Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukkan Password"
                                    disabled={isSubmitting}
                                    {...register('password')}
                                    className={`w-full bg-slate-50 border-2 rounded-xl pl-4 pr-12 py-3.5 text-sm font-bold outline-none transition-all text-slate-800 ${errors.password ? 'border-rose-400 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-blue-500 focus:bg-white'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-14 mt-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Sedang Otentikasi...
                                </>
                            ) : (
                                'Masuk ke Sistem'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <Link to="/" className="text-slate-400 hover:text-blue-600 text-[10px] font-black uppercase tracking-widest transition-colors">
                            &larr; Kembali ke Portal Publik
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}