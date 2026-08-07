// apps/web/src/pages/technician/MyTasks.tsx
import { useNavigate } from 'react-router-dom';
import { format, isPast, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { MapPin, Clock, AlertTriangle, CheckCircle2, Wrench, FolderGit } from 'lucide-react';

import { useMyTasks } from '@/hooks/useTicketQueries';

export default function MyTasks() {
    const navigate = useNavigate();
    const { data: tasks = [], isLoading } = useMyTasks();

    if (isLoading) {
        return (
            <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                Menarik Daftar Tugas...
            </div>
        );
    }

    // Filter tugas yang masih aktif (Belum SELESAI)
    const activeTasks = tasks.filter((t: any) => t.status !== 'SELESAI');

    return (
        <div className="max-w-3xl mx-auto flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 pb-12">
            <div className="flex flex-col mb-8">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Tugas Lapangan</h1>
                <p className="text-slate-500 text-xs font-medium mt-1">
                    Daftar Surat Perintah Kerja (SLA) yang ditugaskan kepada Anda.
                </p>
            </div>

            <div className="flex flex-col gap-6">
                {activeTasks.length > 0 ? (
                    activeTasks.map((task: any) => {
                        const deadlineDate = task.deadline_at ? parseISO(task.deadline_at) : null;
                        const isBreached = deadlineDate && isPast(deadlineDate) && !['REVIEW_ADMIN'].includes(task.status);

                        return (
                            <div key={task.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-transform hover:-translate-y-1">

                                {/* Header Kartu */}
                                <div className={`p-4 flex items-center justify-between border-b border-slate-100 ${isBreached ? 'bg-rose-50' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white rounded-md shadow-sm ${task.priority === 'URGENT' ? 'bg-rose-600 animate-pulse' :
                                                task.priority === 'TINGGI' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`}>
                                            {task.priority || 'NORMAL'}
                                        </span>
                                        <span className="text-[10px] font-mono font-bold text-slate-500">
                                            {task.report?.ticket_number || 'TICKET-INTERNAL'}
                                        </span>
                                    </div>

                                    {/* Indikator SLA */}
                                    {deadlineDate && (
                                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isBreached ? 'text-rose-600' : 'text-slate-500'}`}>
                                            {isBreached ? <AlertTriangle size={14} /> : <Clock size={14} />}
                                            {format(deadlineDate, 'dd MMM yyyy', { locale: id })}
                                        </div>
                                    )}
                                </div>

                                {/* Body Kartu */}
                                <div className="p-6">
                                    <h3 className="text-base font-black text-slate-800 leading-tight mb-3">
                                        {task.asset?.nama_aset || 'Aset Tidak Diketahui'}
                                    </h3>

                                    <div className="flex items-start gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <MapPin size={16} className="text-rose-500 shrink-0 mt-0.5" />
                                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                                            {task.report?.alamat || task.asset?.alamat_fisik || 'Alamat tidak spesifik'}
                                        </p>
                                    </div>

                                    <div className="space-y-1 mb-6">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Instruksi Admin:</span>
                                        <p className="text-xs font-bold text-slate-700 italic border-l-2 border-blue-500 pl-3">
                                            "{task.instruksi_admin || 'Silakan cek kondisi di lapangan dan lakukan perbaikan.'}"
                                        </p>
                                    </div>

                                    {/* Tombol Eksekusi Mobile-Friendly */}
                                    {task.status === 'REVIEW_ADMIN' ? (
                                        <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 py-4 rounded-xl text-center flex items-center justify-center gap-2">
                                            <CheckCircle2 size={18} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Menunggu Validasi Pusat</span>
                                        </div>
                                    ) : (
                                        <button
                                            // Kirim data task ke halaman eksekusi agar tidak perlu fetch ulang
                                            onClick={() => navigate(`/my-tasks/${task.id}/execute`, { state: { task } })}
                                            className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Wrench size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Mulai Eksekusi / Lapor Selesai</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <FolderGit size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Tidak Ada Tugas Aktif</h3>
                        <p className="text-xs font-medium text-slate-500 mt-2">Anda telah menyelesaikan semua pekerjaan Anda. Selamat beristirahat!</p>
                    </div>
                )}
            </div>
        </div>
    );
}