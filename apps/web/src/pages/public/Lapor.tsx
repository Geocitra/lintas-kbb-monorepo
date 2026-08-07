// apps/web/src/pages/public/Lapor.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Send, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

import { CreatePublicReportSchema, type CreatePublicReportDTO } from '@dishub/types';
import MapPicker from '@/components/ui/MapPicker';
import { useTicketStorage } from '@/hooks/useTicketStorage';
import { api } from '@/lib/api';

export default function Lapor() {
    const navigate = useNavigate();
    const { addTicket } = useTicketStorage();

    // State khusus untuk file foto agar bisa di-preview
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Inisialisasi Form
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CreatePublicReportDTO>({
        resolver: zodResolver(CreatePublicReportSchema),
        defaultValues: {
            kontak_pelapor: '62', // Membantu user dengan prefix 62
        }
    });

    // Mutasi (API Call) menggunakan TanStack Query
    const submitMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            // Kita menggunakan axios (api.ts) untuk mengirim FormData (multipart/form-data)
            const res: any = await api.post('/reports/public', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        onSuccess: (data) => {
            // 1. Simpan tiket ke LocalStorage HP Warga
            addTicket(data.ticket_number);

            // 2. Tampilkan Toast Sukses
            toast.success('Laporan berhasil dikirim! Mengalihkan ke pelacakan...');

            // 3. Arahkan ke halaman pelacakan
            navigate('/track');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal mengirim laporan. Periksa koneksi Anda.');
        },
    });

    // Handler Perubahan Foto Kamera
    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Ukuran foto maksimal 5MB!');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));

            // Beritahu React Hook Form bahwa foto sudah terisi (agar Zod tidak error)
            setValue('foto_kejadian', file.name, { shouldValidate: true });
        }
    };

    // Proses Submit
    const onSubmit = (data: CreatePublicReportDTO) => {
        if (!selectedFile) {
            toast.error('Bukti foto kejadian wajib dilampirkan!');
            return;
        }
        if (!data.asset_id || !data.lat || !data.lng) {
            toast.error('Anda harus mengunci lokasi GPS dan memilih aset terdekat!');
            return;
        }

        // Bangun FormData
        const formData = new FormData();
        formData.append('nama_pelapor', data.nama_pelapor || '');
        formData.append('kontak_pelapor', data.kontak_pelapor);
        formData.append('judul_laporan', data.judul_laporan);
        formData.append('deskripsi', data.deskripsi);
        formData.append('kategori_kerusakan', data.kategori_kerusakan);
        formData.append('lat', data.lat.toString());
        formData.append('lng', data.lng.toString());
        formData.append('asset_id', data.asset_id);

        // NAMA FIELD HARUS 'foto' agar ditangkap oleh Multer Middleware kita!
        formData.append('foto', selectedFile);

        // Tembakkan Mutasi
        submitMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center p-4 md:p-8 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-2xl h-fit">

                <div className="text-center mb-8">
                    <span className="inline-block px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                        Layanan Darurat
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight">
                        Lapor Kerusakan Aset
                    </h1>
                    <p className="text-slate-500 mt-2 text-xs font-medium leading-relaxed max-w-sm mx-auto">
                        Bantu kami menjaga infrastruktur Bandung Barat. Laporan Anda akan ditangani secepatnya.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-left">

                    {/* BAGIAN 1: LOKASI & ASET */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">1</span>
                            Lokasi Kejadian
                        </h3>

                        {/* Menggunakan MapPicker cerdas yang kita buat sebelumnya */}
                        <div className="bg-slate-50 p-2 md:p-4 rounded-2xl border border-slate-200">
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
                                <p className="text-[10px] font-bold text-rose-500 mt-2 text-center">
                                    ⚠️ Anda wajib mengunci lokasi dan memilih aset yang rusak!
                                </p>
                            )}
                        </div>
                    </div>

                    {/* BAGIAN 2: BUKTI FOTO */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">2</span>
                            Bukti Foto (Wajib)
                        </h3>

                        <div className="relative group">
                            {previewUrl ? (
                                <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-inner border-4 border-slate-100">
                                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview Kejadian" />
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedFile(null); setPreviewUrl(null); setValue('foto_kejadian', ''); }}
                                        className="absolute top-4 right-4 bg-rose-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg"
                                    >
                                        Ganti Foto
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer">
                                    <div className="w-14 h-14 bg-white shadow-lg rounded-2xl flex items-center justify-center text-slate-400 mb-3 group-hover:text-blue-500">
                                        <Camera size={28} />
                                    </div>
                                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Ambil Foto Kejadian</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">Gunakan Kamera HP Anda</p>

                                    {/* HTML5 Capture: Memaksa membuka kamera hp langsung */}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={handlePhotoCapture}
                                    />
                                </label>
                            )}
                        </div>
                        {errors.foto_kejadian && <p className="text-[10px] font-bold text-rose-500">{errors.foto_kejadian.message}</p>}
                    </div>

                    {/* BAGIAN 3: DETAIL KERUSAKAN & KONTAK */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">3</span>
                            Detail & Kontak
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Judul Laporan</label>
                                <input
                                    type="text"
                                    {...register('judul_laporan')}
                                    placeholder="Contoh: Lampu PJU Mati Total"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-slate-800"
                                />
                                {errors.judul_laporan && <p className="text-[10px] text-rose-500 font-bold">{errors.judul_laporan.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori Kerusakan</label>
                                <select
                                    {...register('kategori_kerusakan')}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-slate-800 appearance-none cursor-pointer"
                                >
                                    <option value="">-- Pilih Jenis Kerusakan --</option>
                                    <option value="Rusak Fisik / Patah">Rusak Fisik / Patah</option>
                                    <option value="Mati Total / Tidak Berfungsi">Mati Total / Tidak Berfungsi</option>
                                    <option value="Hilang / Dicuri">Hilang / Dicuri</option>
                                    <option value="Berubah Posisi">Berubah Posisi</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                                {errors.kategori_kerusakan && <p className="text-[10px] text-rose-500 font-bold">{errors.kategori_kerusakan.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-between">
                                    <span>No. WA Anda (Awali 62)</span>
                                    <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md">Untuk Tiket</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('kontak_pelapor')}
                                    placeholder="62812345678"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-slate-800"
                                />
                                {errors.kontak_pelapor && <p className="text-[10px] text-rose-500 font-bold">{errors.kontak_pelapor.message}</p>}
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Anda</label>
                                <input
                                    type="text"
                                    {...register('nama_pelapor')}
                                    placeholder="Boleh disamarkan / inisial"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-slate-800"
                                />
                                {errors.nama_pelapor && <p className="text-[10px] text-rose-500 font-bold">{errors.nama_pelapor.message}</p>}
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deskripsi Tambahan</label>
                                <textarea
                                    {...register('deskripsi')}
                                    rows={3}
                                    placeholder="Jelaskan ciri-ciri atau posisi spesifik agar mudah ditemukan teknisi..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-500 text-slate-800 resize-none"
                                ></textarea>
                                {errors.deskripsi && <p className="text-[10px] text-rose-500 font-bold">{errors.deskripsi.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={submitMutation.isPending}
                            className="w-full bg-slate-900 hover:bg-blue-600 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {submitMutation.isPending ? (
                                <><Loader2 size={18} className="animate-spin" /> Memproses Laporan...</>
                            ) : (
                                <><Send size={18} /> Kirim Laporan Resmi</>
                            )}
                        </button>
                        <p className="text-center text-[9px] font-bold text-slate-400 mt-4 flex items-center justify-center gap-1.5">
                            <Info size={12} /> Dengan melapor, Anda berkontribusi menjaga fasilitas KBB.
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
}