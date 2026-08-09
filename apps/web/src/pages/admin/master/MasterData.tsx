// apps/web/src/pages/admin/master/MasterData.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, Plus, Trash2, Edit2, Check, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function MasterData() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'kategori' | 'seksi'>('kategori');

    // State Edit / Input
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form inputs Kategori
    const [catNama, setCatNama] = useState('');
    const [catKode, setCatKode] = useState('');
    const [catIsSpatial, setCatIsSpatial] = useState(true);
    const [catSeksiId, setCatSeksiId] = useState('');

    // Form inputs Seksi
    const [seksiNama, setSeksiNama] = useState('');
    const [seksiDeskripsi, setSeksiDeskripsi] = useState('');
    // Fetch data
    const { data: categories = [], isLoading: loadingCat } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res: any = await api.get('/categories');
            return res.data?.data || res.data || [];
        }
    });

    const { data: seksiList = [], isLoading: loadingSeksi } = useQuery({
        queryKey: ['seksi'],
        queryFn: async () => {
            const res: any = await api.get('/seksi');
            return res.data?.data || res.data || [];
        }
    });

    // Mutations Kategori
    const createCatMutation = useMutation({
        mutationFn: async (data: any) => await api.post('/categories', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Kategori berhasil ditambahkan');
            resetForms();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menambahkan kategori')
    });

    const updateCatMutation = useMutation({
        mutationFn: async ({ id, data }: any) => await api.put(`/categories/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Kategori berhasil diperbarui');
            resetForms();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal memperbarui kategori')
    });

    const deleteCatMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Kategori berhasil dihapus');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menghapus kategori. Kategori ini mungkin masih digunakan oleh aset.')
    });

    // Mutations Seksi
    const createSeksiMutation = useMutation({
        mutationFn: async (data: any) => await api.post('/seksi', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seksi'] });
            toast.success('Seksi berhasil ditambahkan');
            resetForms();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menambahkan seksi')
    });

    const updateSeksiMutation = useMutation({
        mutationFn: async ({ id, data }: any) => await api.put(`/seksi/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seksi'] });
            toast.success('Seksi berhasil diperbarui');
            resetForms();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal memperbarui seksi')
    });

    const deleteSeksiMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/seksi/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seksi'] });
            toast.success('Seksi berhasil dihapus');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menghapus seksi. Seksi ini mungkin masih digunakan oleh user.')
    });
    const resetForms = () => {
        setIsAdding(false);
        setEditingId(null);
        setCatNama('');
        setCatKode('');
        setCatIsSpatial(true);
        setCatSeksiId('');
        setSeksiNama('');
        setSeksiDeskripsi('');
    };

    const handleEditStart = (item: any) => {
        setEditingId(item.id);
        setIsAdding(false);
        if (activeTab === 'kategori') {
            setCatNama(item.nama);
            setCatKode(item.kode);
            setCatIsSpatial(item.is_spatial);
            setCatSeksiId(item.seksi_id || '');
        } else {
            setSeksiNama(item.nama_seksi);
            setSeksiDeskripsi(item.deskripsi || '');
        }
    };

    const handleSave = () => {
        if (activeTab === 'kategori') {
            if (!catNama || !catKode) {
                toast.error('Semua kolom wajib diisi');
                return;
            }
            const payload = { nama: catNama, kode: catKode.toUpperCase(), is_spatial: catIsSpatial, seksi_id: catSeksiId || null };
            if (editingId) {
                updateCatMutation.mutate({ id: editingId, data: payload });
            } else {
                createCatMutation.mutate(payload);
            }
        } else {
            if (!seksiNama) {
                toast.error('Nama seksi wajib diisi');
                return;
            }
            const payload = { nama_seksi: seksiNama, deskripsi: seksiDeskripsi };
            if (editingId) {
                updateSeksiMutation.mutate({ id: editingId, data: payload });
            } else {
                createSeksiMutation.mutate(payload);
            }
        }
    };
    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`HAPUS MASTER DATA: Apakah Anda yakin ingin menghapus "${name}"?`)) {
            if (activeTab === 'kategori') {
                deleteCatMutation.mutate(id);
            } else {
                deleteSeksiMutation.mutate(id);
            }
        }
    };

    return (
        <div className="flex flex-col min-h-full w-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800">
                        <Database size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            Data Master
                            <Shield size={16} className="text-slate-400" />
                        </h1>
                        <p className="text-slate-400 text-xs font-medium mt-0.5">
                            Kelola kategori aset dan seksi/bidang organisasi
                        </p>
                    </div>
                </div>
                {!isAdding && !editingId && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest transition-colors"
                    >
                        <Plus size={16} />
                        Tambah {activeTab === 'kategori' ? 'Kategori' : 'Seksi'}
                    </button>
                )}
            </div>

            {/* Tab Controls */}
            <div className="flex border-b border-slate-200 mb-6 bg-white p-1">
                <button
                    onClick={() => { setActiveTab('kategori'); resetForms(); }}
                    className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'kategori' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Kategori Aset
                </button>
                <button
                    onClick={() => { setActiveTab('seksi'); resetForms(); }}
                    className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'seksi' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Seksi Dinas
                </button>
            </div>

            {/* Inline Form Add / Edit (No box, flat design) */}
            {(isAdding || editingId) && (
                <div className="mb-6 bg-slate-100 p-6 border-l-4 border-l-blue-600 flex flex-col gap-4 animate-in fade-in">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {editingId ? 'Edit Data Master' : 'Tambah Data Master Baru'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {activeTab === 'kategori' ? (
                            <>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Kode Kategori *</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: PJU, RMB, KND"
                                        value={catKode}
                                        onChange={e => setCatKode(e.target.value)}
                                        disabled={!!editingId}
                                        className="bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 uppercase"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nama Kategori *</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Penerangan Jalan Umum"
                                        value={catNama}
                                        onChange={e => setCatNama(e.target.value)}
                                        className="bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Penanggung Jawab</label>
                                    <select
                                        value={catSeksiId}
                                        onChange={e => setCatSeksiId(e.target.value)}
                                        className="bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none"
                                    >
                                        <option value="">-- Tanpa Seksi --</option>
                                        {seksiList.map((sk: any) => (
                                            <option key={sk.id} value={sk.id}>{sk.nama_seksi}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5 justify-center pl-2">
                                    <label className="flex items-center gap-2 cursor-pointer mt-4">
                                        <input
                                            type="checkbox"
                                            checked={catIsSpatial}
                                            onChange={e => setCatIsSpatial(e.target.checked)}
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Aset Spasial</span>
                                    </label>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col gap-1.5 md:col-span-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nama Seksi *</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Seksi PJU"
                                        value={seksiNama}
                                        onChange={e => setSeksiNama(e.target.value)}
                                        className="bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-3">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Deskripsi Seksi</label>
                                    <input
                                        type="text"
                                        placeholder="Deskripsi tugas atau keterangan bidang..."
                                        value={seksiDeskripsi}
                                        onChange={e => setSeksiDeskripsi(e.target.value)}
                                        className="bg-white border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-800"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                        <button
                            onClick={resetForms}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                        >
                            <X size={12} /> Batal
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                        >
                            <Check size={12} /> Simpan
                        </button>
                    </div>
                </div>
            )}

            {/* List Data Grid (Premium flat list, no border outline, no bg) */}
            {activeTab === 'kategori' ? (
                <div className="bg-white border border-slate-200">
                    {loadingCat ? (
                        <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Memuat Kategori...</div>
                    ) : categories.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">Tidak Ada Kategori Terdaftar</div>
                    ) : (
                        <table className="w-full text-left text-xs font-medium text-slate-700">
                            <thead className="bg-slate-950 text-white uppercase tracking-wider text-[9px] font-black">
                                <tr>
                                    <th className="px-6 py-4">Kode</th>
                                    <th className="px-6 py-4">Nama Kategori</th>
                                    <th className="px-6 py-4">Penanggung Jawab</th>
                                    <th className="px-6 py-4">Sifat Aset</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categories.map((cat: any) => (
                                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">{cat.kode}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{cat.nama}</td>
                                        <td className="px-6 py-4 font-bold text-slate-500">{cat.seksi?.nama_seksi || '—'}</td>
                                        <td className="px-6 py-4">
                                            {cat.is_spatial ? (
                                                <span className="text-blue-600 font-bold text-[9px] uppercase tracking-wider">Spasial (Tidak Bergerak)</span>
                                            ) : (
                                                <span className="text-amber-600 font-bold text-[9px] uppercase tracking-wider">Non-Spasial (Bergerak)</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right flex gap-3 justify-end items-center">
                                            <button onClick={() => handleEditStart(cat)} className="text-slate-400 hover:text-blue-600 transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(cat.id, cat.nama)} className="text-slate-400 hover:text-rose-600 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div className="bg-white border border-slate-200">
                    {loadingSeksi ? (
                        <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Memuat Seksi...</div>
                    ) : seksiList.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">Tidak Ada Seksi Terdaftar</div>
                    ) : (
                        <table className="w-full text-left text-xs font-medium text-slate-700">
                            <thead className="bg-slate-950 text-white uppercase tracking-wider text-[9px] font-black">
                                <tr>
                                    <th className="px-6 py-4">Nama Seksi</th>
                                    <th className="px-6 py-4">Deskripsi Tugas</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {seksiList.map((sk: any) => (
                                    <tr key={sk.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{sk.nama_seksi}</td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">{sk.deskripsi || '—'}</td>
                                        <td className="px-6 py-4 text-right flex gap-3 justify-end items-center">
                                            <button onClick={() => handleEditStart(sk)} className="text-slate-400 hover:text-blue-600 transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(sk.id, sk.nama_seksi)} className="text-slate-400 hover:text-rose-600 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
