// apps/web/src/pages/admin/assignments/AssignmentList.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRightLeft, Plus, Check, X, Shield, Clock, AlertTriangle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AssignmentList() {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);

    // Form states
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [kondisiSerahTerima, setKondisiSerahTerima] = useState('');

    // State untuk pengembalian
    const [returningId, setReturningId] = useState<string | null>(null);
    const [kondisiKembali, setKondisiKembali] = useState('');

    // 1. Fetch data peminjaman
    const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
        queryKey: ['assignments'],
        queryFn: async () => {
            const res: any = await api.get('/assignments');
            return res.data?.data || res.data || [];
        }
    });

    // 2. Fetch all assets (untuk pilihan serah terima, kita filter yang NON-SPASIAL dan status GUDANG)
    const { data: assetData } = useQuery({
        queryKey: ['available-assets-assignment'],
        queryFn: async () => {
            const res: any = await api.get('/assets', { params: { limit: 100 } });
            return res.data || res || [];
        }
    });
    const assets = Array.isArray(assetData) ? assetData : assetData?.data || [];
    const availableMobileAssets = assets.filter((a: any) =>
        a.kategori?.is_spatial === false && a.status_operasional === 'GUDANG'
    );
    // 3. Fetch daftar pegawai
    const { data: userData } = useQuery({
        queryKey: ['employees-assignment'],
        queryFn: async () => {
            const res: any = await api.get('/users');
            return res.data?.data || res.data || [];
        }
    });
    const employees = userData || [];

    // Mutations
    const handoverMutation = useMutation({
        mutationFn: async (data: any) => {
            const res: any = await api.post('/assignments/handover', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            queryClient.invalidateQueries({ queryKey: ['available-assets-assignment'] });
            toast.success('Peminjaman aset berhasil dicatat!');
            resetForm();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal memproses peminjaman');
        }
    });

    const returnMutation = useMutation({
        mutationFn: async ({ assetId, kondisi }: { assetId: string; kondisi: string }) => {
            const res: any = await api.post(`/assignments/return/${assetId}`, { kondisi_akhir: kondisi });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            queryClient.invalidateQueries({ queryKey: ['available-assets-assignment'] });
            toast.success('Aset berhasil dikembalikan ke Gudang');
            setReturningId(null);
            setKondisiKembali('');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal memproses pengembalian');
        }
    });

    const resetForm = () => {
        setIsAdding(false);
        setSelectedAssetId('');
        setSelectedUserId('');
        setKondisiSerahTerima('');
    };

    const handleHandoverSubmit = () => {
        if (!selectedAssetId || !selectedUserId || !kondisiSerahTerima) {
            toast.error('Semua kolom wajib diisi');
            return;
        }
        handoverMutation.mutate({
            asset_id: selectedAssetId,
            user_id: selectedUserId,
            kondisi_serah_terima: kondisiSerahTerima,
            foto_bukti: 'serah_terima_default.jpg',
        });
    };

    const handleReturnSubmit = (assetId: string) => {
        if (!kondisiKembali) {
            toast.error('Tuliskan kondisi akhir pengembalian aset');
            return;
        }
        returnMutation.mutate({ assetId, kondisi: kondisiKembali });
    };

    return (
        <div className="flex flex-col min-h-full w-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800">
                        <ArrowRightLeft size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            Peminjaman & PIC Aset
                            <Shield size={16} className="text-slate-400" />
                        </h1>
                        <p className="text-slate-400 text-xs font-medium mt-0.5">
                            Kelola tanggung jawab pemakaian kendaraan dan alat logistik bergerak
                        </p>
                    </div>
                </div>
                {!isAdding && !returningId && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest transition-colors"
                    >
                        <Plus size={16} />
                        Serah Terima Aset
                    </button>
                )}
            </div>

            {/* Form Peminjaman Baru (Flat design, borderless, clean layout) */}
            {isAdding && (
                <div className="mb-6 bg-slate-100 p-6 border-l-4 border-l-blue-600 flex flex-col gap-4 animate-in fade-in">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Form Serah Terima Aset Bergerak (Handover)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Pilih Aset */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Aset Logistik (Di Gudang) *</label>
                            <select
                                value={selectedAssetId}
                                onChange={e => setSelectedAssetId(e.target.value)}
                                className="bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800"
                            >
                                <option value="">-- Pilih Aset Bergerak --</option>
                                {availableMobileAssets.map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.nama_aset} [{a.kode_inventaris || 'Tanpa Kode'}]</option>
                                ))}
                            </select>
                        </div>
                        {/* Pilih Penerima */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Staff Penerima / PIC *</label>
                            <select
                                value={selectedUserId}
                                onChange={e => setSelectedUserId(e.target.value)}
                                className="bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800"
                            >
                                <option value="">-- Pilih Pegawai --</option>
                                {employees.map((e: any) => (
                                    <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                                ))}
                            </select>
                        </div>
                        {/* Kondisi */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Kondisi Serah Terima *</label>
                            <input
                                type="text"
                                placeholder="Contoh: Mesin normal, bensin penuh, mulus"
                                value={kondisiSerahTerima}
                                onChange={e => setKondisiSerahTerima(e.target.value)}
                                className="bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                        >
                            <X size={12} /> Batal
                        </button>
                        <button
                            onClick={handleHandoverSubmit}
                            disabled={handoverMutation.isPending}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <Check size={12} /> Proses Serah Terima
                        </button>
                    </div>
                </div>
            )}

            {/* Inline Form Pengembalian (Return) */}
            {returningId && (
                <div className="mb-6 bg-amber-50 p-6 border-l-4 border-l-amber-500 flex flex-col gap-4 animate-in fade-in">
                    <h3 className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                        <AlertTriangle size={12} /> Form Pengembalian Aset Bergerak ke Gudang
                    </h3>
                    <div className="flex flex-col gap-1.5 max-w-xl">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Kondisi Akhir Saat Dikembalikan *</label>
                        <input
                            type="text"
                            placeholder="Contoh: Kendaraan kembali mulus, solar setengah tanki, mesin aman"
                            value={kondisiKembali}
                            onChange={e => setKondisiKembali(e.target.value)}
                            className="bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800"
                        />
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => { setReturningId(null); setKondisiKembali(''); }}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                        >
                            <X size={12} /> Batal
                        </button>
                        <button
                            onClick={() => handleReturnSubmit(returningId)}
                            disabled={returnMutation.isPending}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <Check size={12} /> Konfirmasi Pengembalian
                        </button>
                    </div>
                </div>
            )}

            {/* Daftar Riwayat Peminjaman (Flat table list, no borders, no bg) */}
            <div className="bg-white border border-slate-200">
                {loadingAssignments ? (
                    <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Memuat Riwayat Peminjaman...</div>
                ) : assignments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">Belum Ada Riwayat Serah Terima Aset</div>
                ) : (
                    <table className="w-full text-left text-xs font-medium text-slate-700">
                        <thead className="bg-slate-950 text-white uppercase tracking-wider text-[9px] font-black">
                            <tr>
                                <th className="px-6 py-4">Aset</th>
                                <th className="px-6 py-4">Penanggung Jawab (PIC)</th>
                                <th className="px-6 py-4">Tanggal Serah</th>
                                <th className="px-6 py-4">Status & Kondisi</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {assignments.map((as: any) => {
                                const isReturned = !!as.returned_at;
                                return (
                                    <tr key={as.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{as.asset?.nama_aset}</span>
                                                <span className="text-[9px] font-mono font-bold text-blue-600 uppercase mt-0.5">{as.asset?.kode_inventaris || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                                <User size={13} className="text-slate-400" />
                                                <span>{as.user?.name}</span>
                                                <span className="text-[9px] font-mono font-bold text-slate-400">({as.user?.nip || 'Non-PNS'})</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {format(new Date(as.assigned_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {isReturned ? (
                                                    <span className="text-slate-500 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                                                        ✓ Sudah Kembali
                                                    </span>
                                                ) : (
                                                    <span className="text-blue-600 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                                                        <Clock size={11} /> Sedang Dipakai
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-500 font-medium">
                                                    Kondisi Serah: <strong className="text-slate-700">"{as.kondisi_serah_terima}"</strong>
                                                    {isReturned && (
                                                        <> | Kondisi Kembali: <strong className="text-slate-700">"{as.kondisi_dikembalikan}"</strong></>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!isReturned && (
                                                <button
                                                    onClick={() => setReturningId(as.asset_id)}
                                                    className="px-3 py-1.5 bg-slate-900 hover:bg-amber-600 text-white font-black text-[9px] uppercase tracking-widest transition-colors flex items-center gap-1 ml-auto"
                                                >
                                                    <ArrowRightLeft size={10} /> Kembalikan
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
