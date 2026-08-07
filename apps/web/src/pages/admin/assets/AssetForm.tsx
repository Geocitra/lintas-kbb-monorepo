// apps/web/src/pages/admin/assets/AssetForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2, ImagePlus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

import { CreateAssetSchema, type CreateAssetDTO } from '@dishub/types';
import { useCreateAsset, useUpdateAsset, useAssetById } from '@/hooks/useAssetQueries';
import { api } from '@/lib/api';

export default function AssetForm() {
    const { id } = useParams<{ id: string }>(); // Jika ada ID, berarti mode EDIT
    const isEditMode = !!id;
    const navigate = useNavigate();

    const [categories, setCategories] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Hook Mutasi & Query
    const { data: assetData, isLoading: isLoadingAsset } = useAssetById(id || null);
    const createMutation = useCreateAsset();
    const updateMutation = useUpdateAsset();

    const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<CreateAssetDTO>({
        resolver: zodResolver(CreateAssetSchema),
    });

    // Fetch Kategori Master Data saat halaman dimuat
    useEffect(() => {
        api.get('/categories').then((res: any) => setCategories(res.data)).catch(console.error);
    }, []);

    // Hydration (Isi data form) jika mode EDIT dan data sudah tiba
    useEffect(() => {
        if (isEditMode && assetData) {
            reset({
                kategori_id: assetData.kategori_id,
                kode_inventaris: assetData.kode_inventaris,
                nama_aset: assetData.nama_aset,
                kondisi: assetData.kondisi,
                status_operasional: assetData.status_operasional,
                lat: assetData.lat || undefined,
                lng: assetData.lng || undefined,
                alamat_fisik: assetData.alamat_fisik,
                metadata: assetData.metadata || {},
            });
            // Jika ada foto lama, tampilkan di preview
            if (assetData.foto_utama) {
                setPreviewUrl(`http://localhost:3000${assetData.foto_utama}`);
            }
        }
    }, [isEditMode, assetData, reset]);

    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { toast.error('Maksimal foto 5MB!'); return; }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setValue('foto_utama', file.name); // Beri tahu Zod agar lolos validasi
        }
    };

    const onSubmit = async (data: CreateAssetDTO) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'metadata') {
                formData.append(key, JSON.stringify(value));
            } else if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });

        // FIELD HARUS BERNAMA 'foto' agar ditangkap oleh Multer!
        if (selectedFile) formData.append('foto', selectedFile);

        try {
            if (isEditMode) {
                await updateMutation.mutateAsync({ id, formData });
                toast.success('Aset berhasil diperbarui!');
            } else {
                await createMutation.mutateAsync(formData);
                toast.success('Aset baru berhasil diregistrasi!');
            }
            navigate('/assets');
        } catch (error: any) {
            toast.error(error.message || 'Gagal memproses data.');
        }
    };

    if (isEditMode && isLoadingAsset) return <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Menarik Data Aset...</div>;

    return (
        <div className="max-w-5xl mx-auto flex flex-col min-h-full animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <nav className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2">
                        <Link to="/assets" className="hover:text-blue-600 transition-colors">Data Aset</Link> / {isEditMode ? 'Edit' : 'Create'}
                    </nav>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                        {isEditMode ? 'Edit Data Inventaris' : 'Registrasi Aset Baru'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* KOLOM KIRI: DATA UTAMA */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-5">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-5">
                            1. Identitas Perangkat
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Perangkat</label>
                                <input {...register('nama_aset')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-slate-800" placeholder="CCTV Simpang X..." />
                                {errors.nama_aset && <p className="text-[10px] text-rose-500 font-bold">{errors.nama_aset.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori Master</label>
                                <select {...register('kategori_id')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-slate-800 appearance-none cursor-pointer">
                                    <option value="">-- Pilih Kategori --</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                                </select>
                                {errors.kategori_id && <p className="text-[10px] text-rose-500 font-bold">{errors.kategori_id.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kode Inventaris (Opsional)</label>
                                <input {...register('kode_inventaris')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-slate-800" placeholder="KIB / Nomor Daerah..." />
                            </div>
                        </div>
                    </div>

                    {/* Map Picker untuk Koordinat (Dummy UI Sementara) */}
                    <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100 shadow-inner">
                        <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MapPin size={16} /> 2. Kunci Koordinat Peta
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input {...register('lat', { valueAsNumber: true })} readOnly placeholder="Latitude" className="bg-white border-none rounded-xl px-4 py-3 text-xs font-mono font-bold text-center text-blue-700" />
                            <input {...register('lng', { valueAsNumber: true })} readOnly placeholder="Longitude" className="bg-white border-none rounded-xl px-4 py-3 text-xs font-mono font-bold text-center text-blue-700" />
                        </div>
                        <textarea {...register('alamat_fisik')} rows={2} placeholder="Tulis alamat fisik spesifik..." className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 resize-none outline-none focus:ring-2 focus:ring-blue-200"></textarea>
                        {/* NOTE: Nanti Integrasikan <MapPicker /> di sini seperti pada Lapor.tsx */}
                    </div>
                </div>

                {/* KOLOM KANAN: STATUS & FOTO */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl text-white">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">
                            3. Status Aset
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kondisi Fisik</label>
                                <select {...register('kondisi')} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-white appearance-none">
                                    <option className="text-slate-800" value="BAIK">🟢 BAIK / NORMAL</option>
                                    <option className="text-slate-800" value="RUSAK_RINGAN">🟡 RUSAK RINGAN</option>
                                    <option className="text-slate-800" value="KRITIS">🔴 KRITIS</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Operasional</label>
                                <select {...register('status_operasional')} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-white appearance-none">
                                    <option className="text-slate-800" value="GUDANG">📦 DI GUDANG</option>
                                    <option className="text-slate-800" value="AKTIF">✅ TERPASANG AKTIF</option>
                                    <option className="text-slate-800" value="DALAM_PERBAIKAN">🔧 DALAM PERBAIKAN</option>
                                    <option className="text-slate-800" value="AFKIR">🗑️ AFKIR / MUSNAH</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Area Foto */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-blue-50 transition-all cursor-pointer relative overflow-hidden">
                            {previewUrl ? (
                                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <>
                                    <ImagePlus size={28} className="text-slate-400 mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unggah Foto Utama</span>
                                </>
                            )}
                            <input type="file" accept="image/*" onChange={handlePhotoCapture} className="hidden" />
                        </label>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isEditMode ? 'Simpan Perubahan' : 'Daftarkan Aset'}
                    </button>
                </div>

            </form>
        </div>
    );
}