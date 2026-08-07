// apps/web/src/pages/technician/ExecuteTask.tsx
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Send, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

import { ExecuteTicketSchema, type ExecuteTicketDTO } from '@dishub/types';
import { useExecuteTicket } from '@/hooks/useTicketQueries';

export default function ExecuteTask() {
    const location = useLocation();
    const navigate = useNavigate();
    const task = location.state?.task;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const executeMutation = useExecuteTicket();

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ExecuteTicketDTO>({
        resolver: zodResolver(ExecuteTicketSchema),
    });

    if (!task) {
        return (
            <div className="p-12 text-center text-slate-800">
                <h2 className="text-lg font-black uppercase tracking-widest">Data Tugas Hilang</h2>
                <Link to="/my-tasks" className="text-blue-600 font-bold mt-4 inline-block">Kembali ke Daftar Tugas</Link>
            </div>
        );
    }

    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { toast.error('Maksimal foto 5MB!'); return; }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setValue('foto_hasil', file.name, { shouldValidate: true });
        }
    };

    const onSubmit = async (data: ExecuteTicketDTO) => {
        if (!selectedFile) {
            toast.error('Bukti foto hasil perbaikan wajib dilampirkan!');
            return;
        }

        const formData = new FormData();
        formData.append('catatan_teknisi', data.catatan_teknisi);
        formData.append('foto', selectedFile); // Keyword 'foto' untuk Middleware Multer

        try {
            await executeMutation.mutateAsync({ ticketId: task.id, formData });
            toast.success('Laporan berhasil dikirim! Menunggu Review Admin Pusat.');
            navigate('/my-tasks');
        } catch (error: any) {
            // Menampilkan pesan dari ExifValidator di Backend (jika Foto Hoax)
            toast.error(error.message || 'Gagal mengirim laporan.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 pb-12">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 shadow-sm transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Lapor Selesai</h1>
                    <p className="text-slate-500 text-[10px] font-black mt-1 uppercase tracking-widest">
                        ID: {task.report?.ticket_number}
                    </p>
                </div>
            </div>

            {/* Peringatan Sistem */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <ShieldAlert size={20} className="text-amber-500 shrink-0" />
                <p className="text-[10px] font-bold text-amber-800 leading-relaxed text-justify">
                    Pastikan Anda mengambil foto secara langsung di lokasi kejadian. Sistem kami akan membaca <span className="font-black text-rose-600">Metadata (EXIF) GPS & Waktu</span> dari foto Anda untuk mencegah manipulasi data.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl space-y-6">

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        1. Bukti Foto Hasil (Wajib Kamera)
                    </label>
                    <div className="relative group">
                        {previewUrl ? (
                            <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-inner border-2 border-slate-100">
                                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                <button
                                    type="button"
                                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); setValue('foto_hasil', ''); }}
                                    className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest"
                                >
                                    Ulangi Foto
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all cursor-pointer">
                                <div className="w-14 h-14 bg-white shadow-md rounded-full flex items-center justify-center text-blue-600 mb-3">
                                    <Camera size={28} />
                                </div>
                                <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Buka Kamera HP</p>
                                {/* Atribut 'capture="environment"' akan memaksa browser HP membuka kamera belakang */}
                                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
                            </label>
                        )}
                    </div>
                    {errors.foto_hasil && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.foto_hasil.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        2. Catatan Teknis / Material
                    </label>
                    <textarea
                        {...register('catatan_teknisi')}
                        rows={4}
                        placeholder="Contoh: Lampu LED 120W telah diganti dengan unit baru dari gudang. Kabel terkelupas sudah diisolasi."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 resize-none transition-all"
                    ></textarea>
                    {errors.catatan_teknisi && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.catatan_teknisi.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Kirim Ke Admin Pusat</>}
                </button>
            </form>
        </div>
    );
}