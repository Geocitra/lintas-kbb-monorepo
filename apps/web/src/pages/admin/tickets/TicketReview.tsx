// apps/web/src/pages/admin/tickets/TicketReview.tsx
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import { ReviewTicketSchema, type ReviewTicketDTO } from '@dishub/types';
import { useReviewTicket } from '@/hooks/useTicketQueries';

// Helper Utility untuk Foto Path
const getImageUrl = (path?: string) => {
    if (!path) return 'https://placehold.co/600x400/f8fafc/94a3b8?text=TIDAK+ADA+FOTO';
    if (path.startsWith('http')) return path;
    const origin = import.meta.env.PROD ? window.location.origin : 'http://localhost:3000';
    return `${origin}${path}`;
};

export default function TicketReview() {
    const location = useLocation();
    const navigate = useNavigate();

    // Menangkap data tiket yang dilempar dari TicketList.tsx
    const ticket = location.state?.ticket;

    const reviewMutation = useReviewTicket();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ReviewTicketDTO>({
        resolver: zodResolver(ReviewTicketSchema),
        defaultValues: { keputusan: 'APPROVE' }
    });

    // Jika diakses langsung via URL tanpa data state, tolak dan kembalikan.
    if (!ticket) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-black text-slate-800">Data Tiket Tidak Ditemukan</h2>
                <Link to="/tickets" className="text-blue-600 mt-4 inline-block font-bold">Kembali ke Daftar</Link>
            </div>
        );
    }

    const onSubmit = async (data: ReviewTicketDTO) => {
        try {
            await reviewMutation.mutateAsync({ ticketId: ticket.id, data });

            if (data.keputusan === 'APPROVE') {
                toast.success('Pekerjaan disetujui! Laporan warga otomatis ditutup dan Aset kembali hijau.');
            } else {
                toast.error('Pekerjaan ditolak. Tiket dikembalikan ke aplikasi Teknisi!');
            }
            navigate('/tickets');
        } catch (error: any) {
            toast.error(error.message || 'Gagal memproses review.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col min-h-full animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                        Quality Control (Review)
                    </h1>
                    <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-widest">
                        TIKET: {ticket.report?.ticket_number} | TEKNISI: {ticket.technician?.name}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* PANEL KIRI: BEFORE (Keluhan Asli) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        Kondisi Awal (Laporan Warga)
                    </h3>
                    <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden mb-4 border-2 border-slate-100">
                        <img src={getImageUrl(ticket.report?.foto_kejadian)} className="w-full h-full object-cover" alt="Kondisi Awal" />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Keluhan Pelapor:</p>
                        <p className="text-xs font-bold text-slate-700 italic">"{ticket.report?.deskripsi || 'Tanpa keterangan'}"</p>
                    </div>
                </div>

                {/* PANEL KANAN: AFTER (Hasil Pekerjaan Teknisi) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Hasil Perbaikan (Teknisi)
                    </h3>
                    <div className="relative w-full h-64 bg-slate-100 rounded-2xl overflow-hidden mb-4 border-2 border-slate-100 shadow-inner">
                        <img src={getImageUrl(ticket.foto_hasil)} className="w-full h-full object-cover" alt="Hasil Perbaikan" />
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase shadow-md flex items-center gap-1">
                            <CheckCircle2 size={12} /> Lolos Cek EXIF
                        </div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex-1">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Catatan Penyelesaian Teknisi:</p>
                        <p className="text-xs font-bold text-emerald-800 italic">"{ticket.catatan_teknisi || 'Tanpa catatan'}"</p>
                    </div>
                </div>

            </div>

            {/* PANEL KEPUTUSAN ADMIN */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-white/10 pb-4">
                    Keputusan Final Eksekutif / Admin
                </h3>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <label className="relative cursor-pointer group">
                            <input type="radio" value="APPROVE" {...register('keputusan')} className="peer hidden" />
                            <div className="w-full py-5 rounded-2xl border-2 border-white/20 bg-white/5 text-center peer-checked:bg-emerald-500 peer-checked:border-emerald-400 peer-checked:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex flex-col items-center gap-2">
                                <CheckCircle2 size={28} className="text-emerald-400 peer-checked:text-white" />
                                <span className="font-black text-xs uppercase tracking-widest">Pekerjaan Diterima (Tutup Tiket)</span>
                            </div>
                        </label>

                        <label className="relative cursor-pointer group">
                            <input type="radio" value="REJECT" {...register('keputusan')} className="peer hidden" />
                            <div className="w-full py-5 rounded-2xl border-2 border-white/20 bg-white/5 text-center peer-checked:bg-rose-600 peer-checked:border-rose-400 peer-checked:shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all flex flex-col items-center gap-2">
                                <XCircle size={28} className="text-rose-400 peer-checked:text-white" />
                                <span className="font-black text-xs uppercase tracking-widest">Pekerjaan Ditolak (Kembalikan)</span>
                            </div>
                        </label>
                    </div>
                    {errors.keputusan && <p className="text-[10px] text-rose-500 font-bold">{errors.keputusan.message}</p>}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan / Alasan Review (Wajib)</label>
                        <textarea
                            {...register('catatan_review')}
                            rows={3}
                            placeholder="Berikan alasan kenapa disetujui atau ditolak agar teknisi bisa belajar..."
                            className="w-full bg-black/40 border border-white/20 rounded-xl px-5 py-4 text-xs font-medium text-white outline-none focus:border-blue-500 resize-none transition-all"
                        ></textarea>
                        {errors.catatan_review && <p className="text-[10px] text-rose-500 font-bold">{errors.catatan_review.message}</p>}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Kunci Keputusan & Sebarkan Status'}
                </button>
            </form>
        </div>
    );
}