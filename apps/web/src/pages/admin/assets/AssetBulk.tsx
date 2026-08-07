// apps/web/src/pages/admin/assets/AssetBulk.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Plus, Trash2, PackagePlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { BulkProcurementSchema, type BulkProcurementDTO } from '@dishub/types';
import { useBulkCreateAsset } from '@/hooks/useAssetQueries';
import { api } from '@/lib/api';

export default function AssetBulk() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<any[]>([]);
    const bulkMutation = useBulkCreateAsset();

    const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<BulkProcurementDTO>({
        resolver: zodResolver(BulkProcurementSchema),
        defaultValues: {
            assets: [{ kategori_id: '', kode_inventaris: '', nama_aset: '' }] // Baris pertama default
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'assets'
    });

    useEffect(() => {
        api.get('/categories').then((res: any) => setCategories(res.data)).catch(console.error);
    }, []);

    const onSubmit = async (data: BulkProcurementDTO) => {
        try {
            await bulkMutation.mutateAsync(data);
            toast.success(`${data.assets.length} Aset berhasil dimasukkan ke Gudang!`);
            navigate('/assets');
        } catch (error: any) {
            toast.error(error.message || 'Gagal melakukan bulk insert.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <nav className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2">
                        <Link to="/assets" className="hover:text-blue-600 transition-colors">Data Aset</Link> / Pengadaan Massal
                    </nav>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                        Data Pengadaan Logistik
                    </h1>
                </div>
                <button
                    onClick={() => append({ kategori_id: '', kode_inventaris: '', nama_aset: '' })}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus size={14} /> Tambah Baris Aset
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">

                <div className="p-6 bg-amber-50 border-b border-amber-100 flex items-start gap-3">
                    <PackagePlus className="text-amber-600 shrink-0 mt-0.5" size={18} />
                    <div>
                        <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Informasi Sistem</h4>
                        <p className="text-xs font-medium text-amber-700 leading-relaxed max-w-3xl">
                            Seluruh aset yang diinput melalui form ini otomatis akan diberi status <strong>DI GUDANG</strong> dan tidak akan muncul di Peta Spasial. Teknisi lapangan bertugas mem-plot titik GPS-nya saat melakukan pemasangan fisik (Fitur Sensus Lapangan).
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex flex-wrap md:flex-nowrap items-start gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl relative group">
                                <div className="absolute -left-3 -top-3 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm">
                                    {index + 1}
                                </div>

                                <div className="w-full md:w-1/3">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Kategori Aset</label>
                                    <select {...register(`assets.${index}.kategori_id` as const)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-blue-500 appearance-none">
                                        <option value="">-- Pilih Kategori --</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                                    </select>
                                    {errors.assets?.[index]?.kategori_id && <span className="text-[9px] text-rose-500 font-bold">{errors.assets[index]?.kategori_id?.message}</span>}
                                </div>

                                <div className="w-full md:w-1/4">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Kode Inventaris</label>
                                    <input {...register(`assets.${index}.kode_inventaris` as const)} placeholder="KIB..." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-blue-500" />
                                    {errors.assets?.[index]?.kode_inventaris && <span className="text-[9px] text-rose-500 font-bold">{errors.assets[index]?.kode_inventaris?.message}</span>}
                                </div>

                                <div className="w-full md:flex-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Nama / Spesifikasi</label>
                                    <input {...register(`assets.${index}.nama_aset` as const)} placeholder="Contoh: Tiang PJU Galvanis 9 Meter..." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-blue-500" />
                                    {errors.assets?.[index]?.nama_aset && <span className="text-[9px] text-rose-500 font-bold">{errors.assets[index]?.nama_aset?.message}</span>}
                                </div>

                                <button type="button" onClick={() => remove(index)} disabled={fields.length === 1} className="mt-6 p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-white">
                    <button type="submit" disabled={isSubmitting || fields.length === 0} className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 ml-auto">
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Simpan {fields.length} Data Aset
                    </button>
                </div>

            </form>
        </div>
    );
}