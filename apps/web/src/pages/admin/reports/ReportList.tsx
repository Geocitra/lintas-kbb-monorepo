// apps/web/src/pages/admin/reports/ReportList.tsx
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Wrench, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { DataTable } from '@/components/ui/DataTable';
import { useReports } from '@/hooks/useReportQueries';
import { useAssignTicket } from '@/hooks/useTicketQueries';
import { AssignTicketSchema, type AssignTicketDTO } from '@dishub/types';
import { api } from '@/lib/api';

export default function ReportList() {
    const [page, setPage] = useState(1);
    const limit = 10;

    // State untuk Modal Penugasan
    const [selectedReport, setSelectedReport] = useState<any | null>(null);

    // Data Fetching
    const { data: reportData, isLoading } = useReports(page, limit);
    const assignMutation = useAssignTicket();

    // Ambil daftar teknisi aktif untuk dropdown penugasan
    const { data: usersData } = useQuery({
        queryKey: ['technicians'],
        queryFn: async () => await api.get('/users') // Berasal dari MasterController
    });
    const technicians = usersData?.data?.filter((u: any) => u.role === 'TEKNISI' || u.role === 'KASI') || [];

    // Form Setup
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AssignTicketDTO>({
        resolver: zodResolver(AssignTicketSchema),
        defaultValues: { prioritas: 'NORMAL' }
    });

    const onSubmitAssign = async (data: AssignTicketDTO) => {
        if (!selectedReport) return;
        try {
            await assignMutation.mutateAsync({ reportId: selectedReport.id, data });
            toast.success('Tiket berhasil ditugaskan! SLA Argo telah berjalan.');
            setSelectedReport(null);
            reset();
        } catch (error: any) {
            toast.error(error.message || 'Gagal menugaskan tiket.');
        }
    };

    const columns = useMemo<ColumnDef<any, any>[]>(() => [
        {
            accessorKey: 'ticket_number',
            header: 'KODE TIKET',
            cell: (info) => (
                <span className="font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                    {info.getValue() as string}
                </span>
            )
        },
        {
            accessorKey: 'judul_laporan',
            header: 'INFORMASI LAPORAN',
            cell: (info) => {
                const row = info.row.original;
                return (
                    <div className="flex flex-col min-w-[200px]">
                        <span className="font-bold text-slate-800 line-clamp-1">{row.judul_laporan}</span>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mt-0.5">
                            Pelapor: {row.nama_pelapor || 'Anonim'} | Sumber: {row.sumber_pelapor}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'asset',
            header: 'ASET & LOKASI',
            cell: (info) => {
                const asset = info.getValue() as any;
                if (!asset) return <span className="text-xs text-rose-500 font-bold">N/A (Sistem Gagal Deteksi)</span>;
                return (
                    <div className="flex flex-col max-w-[200px]">
                        <span className="font-bold text-emerald-700 truncate">{asset.nama_aset}</span>
                        <span className="text-[9px] text-slate-500 font-medium truncate mt-0.5" title={asset.alamat_fisik}>
                            <MapPin size={10} className="inline mr-1" />{asset.alamat_fisik || 'Alamat tidak terdata'}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'status',
            header: 'STATUS',
            cell: (info) => {
                const status = (info.getValue() as string).toUpperCase();
                let badge = 'bg-slate-100 text-slate-600';
                if (status === 'MASUK') badge = 'bg-rose-100 text-rose-700 animate-pulse';
                if (status === 'PROSES PERBAIKAN') badge = 'bg-blue-100 text-blue-700';
                if (status === 'SELESAI') badge = 'bg-emerald-100 text-emerald-700';

                return <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${badge}`}>{status}</span>;
            }
        },
        {
            id: 'actions',
            header: 'AKSI',
            cell: (info) => {
                const row = info.row.original;
                // Hanya bisa ditugaskan jika aset valid dan status masih "MASUK" atau "PROSES"
                const canAssign = row.asset_id && !['SELESAI', 'DITOLAK'].includes(row.status?.toUpperCase());

                return (
                    <div className="flex items-center gap-2">
                        <button
                            disabled={!canAssign}
                            onClick={() => setSelectedReport(row)}
                            className="px-4 py-2 bg-slate-900 text-white hover:bg-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <Wrench size={12} /> Triage & Tugaskan
                        </button>
                    </div>
                );
            }
        }
    ], []);

    return (
        <div className="flex flex-col min-h-full w-full animate-in fade-in duration-300">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Triage Laporan</h1>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Validasi aduan warga dan delegasikan Surat Perintah Kerja (SLA) ke teknisi.
                    </p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={reportData?.data || []}
                pageCount={reportData?.meta?.total_pages || 1}
                currentPage={page}
                onPageChange={setPage}
                isLoading={isLoading}
            />

            {/* MODAL PENUGASAN (TRIAGE) */}
            {selectedReport && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">

                        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                <Wrench size={16} className="text-amber-500" /> Form Penugasan Tiket
                            </h2>
                            <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 bg-amber-50/50 border-b border-slate-100">
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Referensi Aduan:</p>
                            <p className="text-sm font-bold text-slate-800">{selectedReport.judul_laporan}</p>
                            <p className="text-xs text-slate-600 mt-1 italic">"{selectedReport.deskripsi}"</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmitAssign)} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pilih Teknisi / Eksekutor</label>
                                <select {...register('technician_id')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-slate-800">
                                    <option value="">-- Pilih Petugas --</option>
                                    {technicians.map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.nip})</option>)}
                                </select>
                                {errors.technician_id && <p className="text-[10px] text-rose-500 font-bold">{errors.technician_id.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Batas Waktu (SLA)</label>
                                    <input type="date" {...register('deadline_at')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-slate-800" />
                                    {errors.deadline_at && <p className="text-[10px] text-rose-500 font-bold">{errors.deadline_at.message as string}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tingkat Prioritas</label>
                                    <select {...register('prioritas')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-slate-800">
                                        <option value="NORMAL">NORMAL</option>
                                        <option value="TINGGI">TINGGI</option>
                                        <option value="URGENT">URGENT (DARURAT)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Instruksi Pengerjaan (SPK)</label>
                                <textarea {...register('instruksi_admin')} rows={3} placeholder="Berikan instruksi teknis kepada petugas..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-500 text-slate-800 resize-none"></textarea>
                                {errors.instruksi_admin && <p className="text-[10px] text-rose-500 font-bold">{errors.instruksi_admin.message}</p>}
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex justify-center items-center gap-2">
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Kirim Penugasan & Nyalakan Timer SLA'}
                            </button>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}