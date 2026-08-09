// apps/web/src/pages/public/Lapor.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Send, Loader2, MapPin, FileText, Phone, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

import { CreatePublicReportSchema, type CreatePublicReportDTO } from '@dishub/types';
import MapPicker from '@/components/ui/MapPicker';
import { useTicketStorage } from '@/hooks/useTicketStorage';
import { api } from '@/lib/api';

const STEP_INFO = [
    { num: '01', icon: <MapPin size={16} />, label: 'Lokasi Kejadian' },
    { num: '02', icon: <Camera size={16} />, label: 'Bukti Foto' },
    { num: '03', icon: <FileText size={16} />, label: 'Detail & Kontak' },
];

const DAMAGE_CATEGORIES = [
    'Rusak Fisik / Patah',
    'Mati Total / Tidak Berfungsi',
    'Hilang / Dicuri',
    'Berubah Posisi',
    'Lainnya',
];

export default function Lapor() {
    const navigate = useNavigate();
    const { addTicket } = useTicketStorage();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreatePublicReportDTO>({
        resolver: zodResolver(CreatePublicReportSchema),
        defaultValues: { kontak_pelapor: '62' },
    });

    const watchedLat = watch('lat');

    const submitMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res: any = await api.post('/reports/public', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        onSuccess: (data) => {
            addTicket(data.ticket_number);
            toast.success('Laporan berhasil dikirim!');
            navigate('/track');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal mengirim laporan. Periksa koneksi Anda.');
        },
    });

    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran foto maksimal 5MB!'); return; }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setValue('foto_kejadian', file.name, { shouldValidate: true });
        }
    };

    const onSubmit = (data: CreatePublicReportDTO) => {
        if (!selectedFile) { toast.error('Bukti foto kejadian wajib dilampirkan!'); return; }
        if (!data.asset_id || !data.lat || !data.lng) { toast.error('Kunci lokasi GPS dan pilih aset yang rusak!'); return; }

        const formData = new FormData();
        formData.append('nama_pelapor', data.nama_pelapor || '');
        formData.append('kontak_pelapor', data.kontak_pelapor);
        formData.append('judul_laporan', data.judul_laporan);
        formData.append('deskripsi', data.deskripsi);
        formData.append('kategori_kerusakan', data.kategori_kerusakan);
        formData.append('lat', data.lat.toString());
        formData.append('lng', data.lng.toString());
        formData.append('asset_id', data.asset_id);
        formData.append('foto', selectedFile);
        submitMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen font-sans" style={{ paddingTop: '72px' }}>

            {/* HERO STRIP */}
            <div className="bg-slate-950 text-white px-6 md:px-12 py-12 border-b border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-3 h-3 bg-rose-500 animate-pulse" />
                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]">
                            Layanan Aduan Publik
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-3">
                        Lapor <span className="text-blue-400">Kerusakan</span> Aset
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                        Bantu kami menjaga infrastruktur Bandung Barat. Laporan Anda akan ditindaklanjuti dalam <strong className="text-white">1×24 jam</strong>.
                    </p>

                    {/* Step indicators */}
                    <div className="flex gap-6 mt-8">
                        {STEP_INFO.map((s, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-blue-400 opacity-60">{s.icon}</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {s.num} {s.label}
                                </span>
                                {i < STEP_INFO.length - 1 && <span className="w-4 h-px bg-slate-700 ml-2" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FORM BODY */}
            <div className="bg-slate-50 min-h-screen">
                <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">

                        {/* ===== SECTION 1: LOKASI ===== */}
                        <div className="bg-white border border-slate-200 mb-4">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-950">
                                <MapPin size={15} className="text-blue-400" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">01 — Lokasi Kejadian</span>
                            </div>
                            <div className="p-4">
                                <MapPicker
                                    onLocationSelect={(lat, lng) => {
                                        setValue('lat', lat, { shouldValidate: true });
                                        setValue('lng', lng, { shouldValidate: true });
                                    }}
                                    onAssetSelect={(assetId) => {
                                        setValue('asset_id', assetId || '', { shouldValidate: true });
                                    }}
                                />
                                {(errors.lat || errors.asset_id) && (
                                    <p className="text-[10px] font-bold text-rose-500 mt-3 flex items-center gap-1.5">
                                        ⚠️ Kunci lokasi GPS dan pilih aset yang rusak terlebih dahulu
                                    </p>
                                )}
                                {watchedLat && (
                                    <p className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
                                        ✓ Lokasi terkunci
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ===== SECTION 2: FOTO ===== */}
                        <div className="bg-white border border-slate-200 mb-4">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-950">
                                <Camera size={15} className="text-blue-400" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">02 — Bukti Foto (Wajib)</span>
                            </div>
                            <div className="p-6">
                                {previewUrl ? (
                                    <div className="relative w-full h-56 overflow-hidden">
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedFile(null); setPreviewUrl(null); setValue('foto_kejadian', ''); }}
                                            className="absolute top-3 right-3 bg-slate-950/80 text-white p-1.5 hover:bg-rose-600 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                        <div className="absolute bottom-3 left-3 bg-slate-950/70 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                            ✓ Foto Siap
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 flex items-center justify-center">
                                                <Camera size={24} className="text-slate-400" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Ambil / Pilih Foto</p>
                                                <p className="text-[10px] text-slate-400 mt-1">JPG, PNG • Maks 5MB</p>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="hidden"
                                            onChange={handlePhotoCapture}
                                        />
                                    </label>
                                )}
                                {errors.foto_kejadian && (
                                    <p className="text-[10px] font-bold text-rose-500 mt-2">{errors.foto_kejadian.message}</p>
                                )}
                            </div>
                        </div>

                        {/* ===== SECTION 3: DETAIL ===== */}
                        <div className="bg-white border border-slate-200 mb-6">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-950">
                                <FileText size={15} className="text-blue-400" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">03 — Detail & Kontak</span>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Judul */}
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Laporan *</label>
                                    <input
                                        type="text"
                                        {...register('judul_laporan')}
                                        placeholder="Contoh: Lampu PJU Mati Total di Jl. Raya Padalarang"
                                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 transition-colors"
                                    />
                                    {errors.judul_laporan && <p className="text-[10px] text-rose-500 font-bold">{errors.judul_laporan.message}</p>}
                                </div>

                                {/* Kategori */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Kerusakan *</label>
                                    <select
                                        {...register('kategori_kerusakan')}
                                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                    >
                                        <option value="">-- Pilih Jenis --</option>
                                        {DAMAGE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {errors.kategori_kerusakan && <p className="text-[10px] text-rose-500 font-bold">{errors.kategori_kerusakan.message}</p>}
                                </div>

                                {/* No WA */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Phone size={10} /> No. WhatsApp * (Awali 62)
                                    </label>
                                    <input
                                        type="text"
                                        {...register('kontak_pelapor')}
                                        placeholder="628123456789"
                                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 transition-colors"
                                    />
                                    {errors.kontak_pelapor && <p className="text-[10px] text-rose-500 font-bold">{errors.kontak_pelapor.message}</p>}
                                </div>

                                {/* Nama */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Anda (Opsional)</label>
                                    <input
                                        type="text"
                                        {...register('nama_pelapor')}
                                        placeholder="Boleh disamarkan / inisial"
                                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                {/* Deskripsi */}
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi Tambahan</label>
                                    <textarea
                                        {...register('deskripsi')}
                                        rows={3}
                                        placeholder="Ciri-ciri atau posisi spesifik agar mudah ditemukan teknisi..."
                                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 transition-colors resize-none"
                                    />
                                    {errors.deskripsi && <p className="text-[10px] text-rose-500 font-bold">{errors.deskripsi.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={submitMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white h-14 font-black text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-60 flex items-center justify-center gap-3 group"
                        >
                            {submitMutation.isPending ? (
                                <><Loader2 size={18} className="animate-spin" /> Memproses Laporan...</>
                            ) : (
                                <><Send size={16} /> Kirim Laporan Resmi <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                        <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">
                            Dengan melapor, Anda membantu menjaga kualitas infrastruktur Kabupaten Bandung Barat.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}