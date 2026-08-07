// apps/web/src/pages/admin/broadcast/AnnouncementList.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Megaphone, Plus, Users, Eye } from 'lucide-react';

import { DataTable } from '@/components/ui/DataTable';
import { useAnnouncements } from '@/hooks/useAnnouncementQueries';

export default function AnnouncementList() {
    const [page, setPage] = useState(1);
    const { data: annData, isLoading } = useAnnouncements(page, 10);

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'title',
            header: 'INFORMASI BROADCAST',
            cell: (info) => {
                const row = info.row.original;
                return (
                    <div className="flex flex-col min-w-[250px] max-w-md">
                        <span className="font-black text-slate-800 truncate text-sm mb-1">{row.title}</span>
                        <span className="text-[10px] font-medium text-slate-500 line-clamp-1 italic">"{row.content}"</span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'target',
            header: 'TARGET AUDIENS',
            cell: (info) => (
                <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1.5 w-fit text-[9px] uppercase tracking-widest">
                    <Users size={12} /> {info.getValue() as string}
                </span>
            )
        },
        {
            accessorKey: 'is_important',
            header: 'SIFAT PESAN',
            cell: (info) => {
                const isImportant = info.getValue() as boolean;
                return isImportant ? (
                    <span className="px-3 py-1.5 bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                        🚨 FORCED POP-UP
                    </span>
                ) : (
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                        INFORMASI BIASA
                    </span>
                );
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'TANGGAL SIARAN',
            cell: (info) => <span className="text-[10px] font-bold text-slate-600">{format(new Date(info.getValue() as string), 'dd MMM yyyy, HH:mm', { locale: id })}</span>
        },
        {
            id: 'actions',
            header: 'AKSI',
            cell: () => (
                <button className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                    <Eye size={12} /> Lihat Laporan Baca
                </button>
            )
        }
    ], []);

    return (
        <div className="flex flex-col min-h-full w-full animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                        <Megaphone className="text-blue-600" size={24} /> Broadcast Center
                    </h1>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Manajemen Surat Edaran dan Instruksi Paksa (Forced Pop-up) ke aplikasi pegawai.
                    </p>
                </div>
                <Link to="/broadcast/create" className="px-5 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                    <Plus size={16} strokeWidth={3} /> Siarkan Pesan Baru
                </Link>
            </div>

            <DataTable
                columns={columns}
                data={annData?.data || []}
                pageCount={annData?.meta?.total_pages || 1}
                currentPage={page}
                onPageChange={setPage}
                isLoading={isLoading}
            />
        </div>
    );
}