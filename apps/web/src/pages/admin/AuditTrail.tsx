// apps/web/src/pages/admin/AuditTrail.tsx
import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ShieldCheck, History } from 'lucide-react';

import { DataTable } from '@/components/ui/DataTable';
import { useAuditTrail } from '@/hooks/useAuditQueries';

export default function AuditTrail() {
    // State untuk Server-Side Pagination
    const [page, setPage] = useState(1);
    const limit = 10; // 10 Baris per halaman

    // Tarik data dari TanStack Query Hook
    const { data: auditData, isLoading } = useAuditTrail(page, limit);

    // Definisi Kolom Tabel Headless
    const columns = useMemo<ColumnDef<any, any>[]>(() => [
        {
            accessorKey: 'createdAt',
            header: 'TANGGAL & WAKTU',
            cell: (info) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800">
                        {format(new Date(info.getValue() as string), 'dd MMM yyyy', { locale: id })}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 font-mono tracking-widest mt-0.5">
                        {format(new Date(info.getValue() as string), 'HH:mm:ss')} WIB
                    </span>
                </div>
            )
        },
        {
            accessorKey: 'actor',
            header: 'AKTOR / PENGGUNA',
            cell: (info) => {
                const actor = info.getValue() as any;
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-blue-700">{actor?.name || 'Sistem Otomatis'}</span>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                            {actor?.role?.replace('_', ' ') || 'SYSTEM'} {actor?.nip ? `• ${actor.nip}` : ''}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'asset',
            header: 'ASET TERDAMPAK',
            cell: (info) => {
                const asset = info.getValue() as any;
                return (
                    <div className="flex flex-col max-w-[200px]">
                        <span className="font-bold text-slate-800 truncate">{asset?.nama_aset || 'Aset Dihapus'}</span>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mt-0.5">
                            {asset?.kode_inventaris || 'Tanpa Kode'}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'action',
            header: 'JENIS AKTIVITAS',
            cell: (info) => {
                const action = info.getValue() as string;
                let bg = 'bg-slate-100 text-slate-600 border-slate-200';

                // Logika pewarnaan otomatis berdasarkan kata kunci aktivitas
                if (action.includes('BUAT') || action.includes('BARU')) bg = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                if (action.includes('UPDATE') || action.includes('MUTASI') || action.includes('SERAH')) bg = 'bg-blue-100 text-blue-700 border-blue-200';
                if (action.includes('HAPUS') || action.includes('AFKIR') || action.includes('TOLAK') || action.includes('BREACH')) bg = 'bg-rose-100 text-rose-700 border-rose-200';
                if (action.includes('SELESAI') || action.includes('SETUJU')) bg = 'bg-amber-100 text-amber-700 border-amber-200';

                return (
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${bg}`}>
                        {action.replace(/_/g, ' ')}
                    </span>
                );
            }
        },
        {
            accessorKey: 'keterangan',
            header: 'KETERANGAN DETAIL',
            cell: (info) => (
                <span className="text-[11px] font-medium text-slate-500 italic leading-relaxed line-clamp-2 max-w-xs">
                    "{info.getValue() as string || 'Tidak ada deskripsi tambahan.'}"
                </span>
            )
        }
    ], []);

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-300">

            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck size={18} className="text-emerald-500" />
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Audit Trail</h1>
                    </div>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Catatan permanen riwayat mutasi, perbaikan, dan aktivitas pengguna dalam sistem.
                    </p>
                </div>

                {/* Indikator Keamanan */}
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm flex items-center gap-3">
                    <History size={16} className="text-blue-600" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Integritas Data</span>
                        <span className="text-xs font-bold text-slate-800">Immutable Log (Read-Only)</span>
                    </div>
                </div>
            </div>

            {/* Tabel Reusable Component */}
            <DataTable
                columns={columns}
                data={auditData?.data || []}
                pageCount={auditData?.meta?.total_pages || 1}
                currentPage={page}
                onPageChange={setPage}
                isLoading={isLoading}
            />

        </div>
    );
}