// apps/web/src/pages/admin/broadcast/AnnouncementForm.tsx
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Megaphone, ShieldAlert, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import { CreateAnnouncementSchema } from '@dishub/types';
import type { CreateAnnouncementDTO } from '@dishub/types';
import { useCreateAnnouncement } from '@/hooks/useAnnouncementQueries';

export default function AnnouncementForm() {
    const navigate = useNavigate();
    const createMutation = useCreateAnnouncement();

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CreateAnnouncementDTO>({
        resolver: zodResolver(CreateAnnouncementSchema) as any,
        defaultValues: { target: 'SEMUA', is_important: false }
    });

    const isImportant = watch('is_important');

    const onSubmit = async (data: CreateAnnouncementDTO) => {
        try {
            await createMutation.mutateAsync(data);
            toast.success('Pesan berhasil disiarkan ke seluruh jaringan!');
            navigate('/pengumuman');
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyiarkan pesan.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col min-h-full animate-in fade-in slide-in-from-bottom-4 pb-12">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/pengumuman" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 shadow-sm transition-colors">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                        Siaran Pesan Baru
                    </h1>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Buat instruksi atau edaran ke aplikasi petugas lapangan / admin.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-xl flex flex-col gap-8">

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Judul Pengumuman</label>
                    <input
                        {...register('title')}
                        placeholder="Contoh: Apel Pagi / Inspeksi Mendadak"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-black outline-none focus:border-blue-500 text-slate-800 transition-colors"
                    />
                    {errors.title && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Isi Pesan Lengkap</label>
                    <textarea
                        {...register('content')}
                        rows={5}
                        placeholder="Tuliskan detail instruksi Anda di sini..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-xs font-medium outline-none focus:border-blue-500 text-slate-800 resize-none transition-colors"
                    ></textarea>
                    {errors.content && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.content.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Audiens</label>
                        <select {...register('target')} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-slate-800">
                            <option value="SEMUA">Semua Jajaran (Admin & Teknisi)</option>
                            <option value="TEKNISI">Khusus Teknisi Lapangan</option>
                            <option value="ADMIN">Khusus Admin Ruang Komando</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Berlaku Sampai (Opsional)</label>
                        <input type="date" {...register('expires_at')} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-slate-800" />
                    </div>
                </div>

                {/* SOCIO-ENGINEERING TOGGLE */}
                <div className={`p-6 rounded-2xl border-2 transition-all ${isImportant ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                    <label className="flex items-start gap-4 cursor-pointer">
                        <div className="pt-1">
                            <input type="checkbox" {...register('is_important')} className="w-5 h-5 accent-rose-600 cursor-pointer" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldAlert size={16} className={isImportant ? 'text-rose-600' : 'text-slate-400'} />
                                <h4 className={`text-sm font-black uppercase tracking-widest ${isImportant ? 'text-rose-700' : 'text-slate-700'}`}>
                                    Tandai sebagai Pengumuman Penting (Wajib Baca)
                                </h4>
                            </div>
                            <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                                Jika dicentang, pengumuman ini akan ditandai sebagai <strong>PENTING</strong> dan muncul dengan highlight merah di feed dan notifikasi semua target audiens.
                            </p>
                        </div>
                    </label>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 ${isImportant ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'}`}
                    >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Megaphone size={20} />}
                        Siarkan Pesan ke Sistem
                    </button>
                </div>

            </form>
        </div>
    );
}