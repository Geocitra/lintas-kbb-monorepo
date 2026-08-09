// apps/web/src/pages/admin/assets/AssetList.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, PackagePlus, Search, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { DataTable } from '@/components/ui/DataTable';
import { useAssets, useDeleteAsset } from '@/hooks/useAssetQueries';
export default function AssetList() {
    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [assetTab, setAssetTab] = useState<'spasial' | 'bergerak'>('spasial');

    const { data: assetData, isLoading } = useAssets(page, limit, {
        search,
        status: statusFilter,
        is_spatial: assetTab === 'spasial'
    });

    const deleteMutation = useDeleteAsset();

    const handleDelete = async (id: string, nama: string) => {
        if (window.confirm(`HAPUS PERMANEN: Apakah Anda yakin ingin mengafkirkan/menghapus aset "${nama}"?`)) {
            try {
                await deleteMutation.mutateAsync(id);
                toast.success('Aset berhasil dihapus/diafkirkan.');
            } catch (error: any) {
                toast.error(error.message || 'Gagal menghapus aset.');
            }
        }
    };

    // Definisi Kolom Headless Table
    const columns = useMemo<ColumnDef<any, any>[]>(() => [
        {
            accessorKey: 'kode_inventaris',
            header: 'ID / KODE',
            cell: (info) => (
                <span className="font-mono text-[11px] font-black text-blue-600">
                    {info.getValue() as string || 'N/A'}
                </span>
            )
        },
        {
            accessorKey: 'nama_aset',
            header: 'NAMA ASET',
            cell: (info) => <span className="font-bold text-slate-800">{info.getValue() as string}</span>
        },
        {
            accessorKey: 'kategori.nama',
            header: 'KATEGORI',
            cell: (info) => <span className="text-[10px] font-bold text-slate-500 uppercase">{info.getValue() as string || '-'}</span>
        },
        {
            accessorKey: 'kondisi',
            header: 'KONDISI',
            cell: (info) => {
                const val = info.getValue() as string;
                let colorClass = 'text-emerald-600';
                if (val?.includes('RUSAK')) colorClass = 'text-amber-600';
                if (val?.includes('KRITIS') || val?.includes('HILANG')) colorClass = 'text-rose-600';

                return (
                    <span className={`text-[10px] font-black tracking-widest uppercase ${colorClass}`}>
                        {val.replace('_', ' ')}
                    </span>
                );
            }
        },
        {
            accessorKey: 'status_operasional',
            header: 'STATUS',
            cell: (info) => <span className="text-[10px] font-bold text-slate-600">{info.getValue() as string}</span>
        },
        {
            id: 'actions',
            header: 'AKSI',
            cell: (info) => {
                const id = info.row.original.id;
                const nama = info.row.original.nama_aset;
                return (
                    <div className="flex items-center gap-4">
                        <Link to={`/assets/${id}/edit`} className="text-slate-500 hover:text-blue-600 transition-colors" title="Edit Data">
                            <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(id, nama)} className="text-slate-400 hover:text-rose-600 transition-colors" title="Afkir / Hapus">
                            <Trash2 size={16} />
                        </button>
                    </div>
                );
            }
        }
    ], []);

    // Handler Pencarian (Bisa ditambahkan debounce untuk performa lebih baik)
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset ke halaman 1 setiap kali mencari
    };

    return (
        <div className="flex flex-col min-h-full w-full animate-in fade-in duration-300">
            {/* Header & Aksi */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Inventaris Aset</h1>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Manajemen master data infrastruktur jalan Dishub KBB.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link to="/assets/bulk" className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-sm">
                        <PackagePlus size={16} /> Pengadaan Massal
                    </Link>
                    <Link to="/assets/create" className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                        <Plus size={16} strokeWidth={3} /> Tambah Satuan
                    </Link>
                </div>
            </div>

            {/* Tab Controls */}
            <div className="flex border-b border-slate-200 mb-6 bg-white p-1">
                <button
                    onClick={() => { setAssetTab('spasial'); setPage(1); }}
                    className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${assetTab === 'spasial' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Aset Tidak Bergerak (Spasial)
                </button>
                <button
                    onClick={() => { setAssetTab('bergerak'); setPage(1); }}
                    className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${assetTab === 'bergerak' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Aset Bergerak (Logistik)
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                <form onSubmit={handleSearch} className="flex-1 min-w-[250px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Cari ID, Kode, atau Nama Aset..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                    />
                </form>

                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                >
                    <option value="">Semua Status</option>
                    <option value="AKTIF">Aktif / Terpasang</option>
                    <option value="GUDANG">Di Gudang</option>
                    <option value="DALAM_PERBAIKAN">Dalam Perbaikan</option>
                    <option value="AFKIR">Afkir / Dihapus</option>
                </select>
            </div>

            {/* Komponen Tabel Reusable */}
            <DataTable
                columns={columns}
                data={assetData?.data || []}
                pageCount={assetData?.meta?.total_pages || 1}
                currentPage={page}
                onPageChange={setPage}
                isLoading={isLoading}
            />
        </div>
    );
}