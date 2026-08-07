// apps/web/src/pages/admin/tickets/TicketList.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { format, isPast, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertOctagon, CheckSquare } from 'lucide-react';

import { DataTable } from '@/components/ui/DataTable';
import { useAllTickets } from '@/hooks/useTicketQueries';

export default function TicketList() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const navigate = useNavigate();

    const { data: ticketData, isLoading } = useAllTickets(page, 10, statusFilter);

    const columns = useMemo<ColumnDef<any, any>[]>(() => [
        {
            accessorKey: 'report.ticket_number',
            header: 'NO. TIKET',
            cell: (info) => (
                <span className="font-mono text-[11px] font-black text-slate-700">
                    {info.getValue() as string}
                </span>
            )
        },
        {
            accessorKey: 'technician.name',
            header: 'TEKNISI PELAKSANA',
            cell: (info) => (
                <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    👷 {info.getValue() as string || 'Belum Ditentukan'}
                </span>
            )
        },
        {
            accessorKey: 'asset.nama_aset',
            header: 'ASET TARGET',
            cell: (info) => (
                <div className="flex flex-col max-w-[200px]">
                    <span className="font-bold text-slate-800 truncate">{info.getValue() as string}</span>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        {info.row.original.asset?.kode_inventaris}
                    </span>
                </div>
            )
        },
        {
            accessorKey: 'deadline_at',
            header: 'SLA DEADLINE',
            cell: (info) => {
                const deadline = info.getValue() as string;
                if (!deadline) return '-';

                const dateObj = parseISO(deadline);
                const breached = isPast(dateObj) && !['SELESAI', 'REVIEW_ADMIN'].includes(info.row.original.status);

                return (
                    <span className={`text-[10px] font-black tracking-widest uppercase ${breached ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200 animate-pulse' : 'text-slate-600'}`}>
                        {breached && <AlertOctagon size={10} className="inline mr-1" />}
                        {format(dateObj, 'dd MMM yyyy', { locale: id })}
                    </span>
                );
            }
        },
        {
            accessorKey: 'status',
            header: 'STATUS TIKET',
            cell: (info) => {
                const status = info.getValue() as string;
                let badge = 'bg-slate-100 text-slate-600';
                if (status === 'DITUGASKAN') badge = 'bg-amber-100 text-amber-700';
                if (status === 'REVIEW_ADMIN') badge = 'bg-blue-600 text-white animate-pulse shadow-lg';
                if (status === 'SELESAI') badge = 'bg-emerald-100 text-emerald-700';

                return <span className={`px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase ${badge}`}>{status.replace('_', ' ')}</span>;
            }
        },
        {
            id: 'actions',
            header: 'AKSI',
            cell: (info) => {
                const row = info.row.original;

                // PINTU MASUK QUALITY CONTROL (Jika teknisi sudah selesai)
                if (row.status === 'REVIEW_ADMIN') {
                    return (
                        <button
                            // Kita kirim seluruh object tiket ke halaman review menggunakan React Router State! (Sangat Hemat Memori)
                            onClick={() => navigate(`/tickets/${row.id}/review`, { state: { ticket: row } })}
                            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors shadow-md flex items-center gap-1.5"
                        >
                            <CheckSquare size={12} /> Verifikasi Hasil
                        </button>
                    );
                }

                return <span className="text-[10px] font-bold text-slate-400 italic">Menunggu...</span>;
            }
        }
    ], [navigate]);

    return (
        <div className="flex flex-col min-h-full w-full animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Monitoring Perbaikan</h1>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Lacak progres tiket perbaikan dari seluruh teknisi di lapangan.
                    </p>
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                >
                    <option value="">Semua Status</option>
                    <option value="DITUGASKAN">Baru Ditugaskan</option>
                    <option value="REVIEW_ADMIN">Menunggu Review Admin</option>
                    <option value="SELESAI">Selesai (Closed)</option>
                </select>
            </div>

            <DataTable
                columns={columns}
                data={ticketData?.data || []}
                pageCount={ticketData?.meta?.total_pages || 1}
                currentPage={page}
                onPageChange={setPage}
                isLoading={isLoading}
            />
        </div>
    );
}