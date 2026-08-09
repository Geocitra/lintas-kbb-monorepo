import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isPast, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { MapPin, Clock, AlertTriangle, CheckCircle2, Wrench, FolderGit } from 'lucide-react';

import { useMyTasks } from '@/hooks/useTicketQueries';

export default function MyTasks() {
    const navigate = useNavigate();
    const { data: tasks = [], isLoading } = useMyTasks();
    const [activeTab, setActiveTab] = useState<'todo' | 'review' | 'completed'>('todo');

    if (isLoading) {
        return (
            <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                Menarik Daftar Tugas...
            </div>
        );
    }

    // Klasifikasi Tugas Berdasarkan Alur Operasional
    const todoTasks = tasks.filter((t: any) => !['REVIEW_ADMIN', 'SELESAI'].includes(t.status));
    const reviewTasks = tasks.filter((t: any) => t.status === 'REVIEW_ADMIN');
    const completedTasks = tasks.filter((t: any) => t.status === 'SELESAI');

    // Ambil list sesuai tab aktif
    const displayTasks = activeTab === 'todo' ? todoTasks : activeTab === 'review' ? reviewTasks : completedTasks;

    return (
        <div className="max-w-3xl mx-auto flex flex-col min-h-full animate-in fade-in slide-in-from-bottom-4 pb-12">
            <div className="flex flex-col mb-8">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Tugas Lapangan</h1>
                <p className="text-slate-500 text-xs font-medium mt-1">
                    Daftar Surat Perintah Kerja (SLA) yang ditugaskan kepada Anda.
                </p>
            </div>

            {/* TAB SELECTOR */}
            <div className="grid grid-cols-3 bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200 gap-1">
                <button
                    onClick={() => setActiveTab('todo')}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'todo'
                            ? 'bg-white text-slate-800 shadow-md scale-[1.02]'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50/50'
                    }`}
                >
                    Perlu Dikerjakan ({todoTasks.length})
                </button>
                <button
                    onClick={() => setActiveTab('review')}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'review'
                            ? 'bg-white text-slate-800 shadow-md scale-[1.02]'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50/50'
                    }`}
                >
                    Menunggu Verifikasi ({reviewTasks.length})
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'completed'
                            ? 'bg-white text-slate-800 shadow-md scale-[1.02]'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50/50'
                    }`}
                >
                    Riwayat Selesai ({completedTasks.length})
                </button>
            </div>

            {/* LIST KARTU TUGAS */}
            <div className="flex flex-col gap-6">
                {displayTasks.length > 0 ? (
                    displayTasks.map((task: any) => {
                        const deadlineDate = task.deadline_at ? parseISO(task.deadline_at) : null;
                        const isBreached = deadlineDate && isPast(deadlineDate) && !['REVIEW_ADMIN', 'SELESAI'].includes(task.status);

                        return (
                            <div key={task.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5">

                                {/* Header Kartu */}
                                <div className={`p-4 flex items-center justify-between border-b border-slate-100 ${isBreached ? 'bg-rose-50' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white rounded-md shadow-sm ${
                                                task.priority === 'URGENT' ? 'bg-rose-600 animate-pulse' :
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

                                    {/* Aksi berdasarkan status */}
                                    {task.status === 'REVIEW_ADMIN' && (
                                        <div className="w-full text-blue-600 py-3 text-center flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] bg-blue-50/50 rounded-xl">
                                            <Clock size={16} />
                                            <span>Pekerjaan Selesai — Menunggu Validasi KASI</span>
                                        </div>
                                    )}

                                    {task.status === 'SELESAI' && (
                                        <div className="w-full text-emerald-600 py-3 text-center flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] bg-emerald-50/50 rounded-xl">
                                            <CheckCircle2 size={16} />
                                            <span>Tugas Telah Diverifikasi & Ditutup</span>
                                        </div>
                                    )}

                                    {!['REVIEW_ADMIN', 'SELESAI'].includes(task.status) && (
                                        <button
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
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                            {activeTab === 'todo'
                                ? 'Tidak Ada Tugas Aktif'
                                : activeTab === 'review'
                                ? 'Tidak Ada Verifikasi Pending'
                                : 'Belum Ada Riwayat Tugas'}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 mt-2">
                            {activeTab === 'todo'
                                ? 'Anda telah menyelesaikan semua pekerjaan Anda. Selamat beristirahat!'
                                : activeTab === 'review'
                                ? 'Semua laporan perbaikan Anda telah diverifikasi oleh KASI.'
                                : 'Anda belum menyelesaikan tugas perbaikan bulan ini.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}