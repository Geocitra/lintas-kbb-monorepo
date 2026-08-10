// apps/web/src/pages/public/Track.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Activity, Clock, CheckCircle2, AlertTriangle, FileSearch } from 'lucide-react';
import { motion } from 'framer-motion';

import { api } from '@/lib/api';
import { useTicketStorage } from '@/hooks/useTicketStorage';

export default function Track() {
    const { savedTickets } = useTicketStorage();
    const [searchInput, setSearchInput] = useState('');
    const [activeTicket, setActiveTicket] = useState<string | null>(
        savedTickets.length > 0 ? savedTickets[0].ticket_number : null
    );

    // React Query untuk memanggil data tiket ke backend
    const { data: reportData, isLoading, isError, error } = useQuery({
        queryKey: ['trackReport', activeTicket],
        queryFn: async () => {
            const res: any = await api.get(`/reports/public/track/${activeTicket}`);
            return res.data;
        },
        enabled: !!activeTicket, // Hanya jalan jika activeTicket tidak kosong
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setActiveTicket(searchInput.toUpperCase().trim());
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-20 px-4 md:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header & Search Bar */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tight">
                        Lacak Laporan
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
                        Pantau progres penanganan aduan infrastruktur Anda secara real-time.
                    </p>

                    <form onSubmit={handleSearch} className="max-w-md mx-auto relative mt-6">
                        <input
                            type="text"
                            placeholder="Masukkan Nomor Tiket (Contoh: LP-2026...)"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full bg-white border-2 border-slate-200 rounded-full px-6 py-4 pr-16 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm transition-all"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 w-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                            <Search size={18} />
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                    {/* Riwayat Tiket di LocalStorage */}
                    <div className="md:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock size={14} /> Riwayat Tiket Saya
                        </h3>

                        {savedTickets.length > 0 ? (
                            <div className="space-y-3">
                                {savedTickets.map((ticket) => (
                                    <button
                                        key={ticket.ticket_number}
                                        onClick={() => setActiveTicket(ticket.ticket_number)}
                                        className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${activeTicket === ticket.ticket_number
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <p className={`text-sm font-black tracking-wider ${activeTicket === ticket.ticket_number ? 'text-blue-700' : 'text-slate-700'}`}>
                                            {ticket.ticket_number}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                                            Dilaporkan: {new Date(ticket.saved_at).toLocaleDateString('id-ID')}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 opacity-50">
                                <FileSearch size={32} className="mx-auto mb-2 text-slate-400" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Belum Ada Riwayat</p>
                            </div>
                        )}
                    </div>

                    {/* Timeline Progres Tiket */}
                    <div className="md:col-span-8">
                        {isLoading ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Menarik Data Satelit...</p>
                            </div>
                        ) : isError ? (
                            <div className="bg-rose-50 rounded-3xl p-8 border border-rose-200 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm mb-4">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="text-lg font-black text-rose-700 mb-2">Tiket Tidak Ditemukan</h3>
                                <p className="text-xs font-medium text-rose-600">{(error as any)?.message || 'Pastikan nomor tiket yang dimasukkan benar.'}</p>
                            </div>
                        ) : reportData ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl"
                            >
                                <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
                                    <div>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
                                            Tiket: {reportData.ticket_number}
                                        </span>
                                        <h2 className="text-xl font-black text-slate-800 leading-tight">
                                            {reportData.judul_laporan}
                                        </h2>
                                        <p className="text-xs font-bold text-slate-500 mt-2 flex items-center gap-1.5">
                                            <Activity size={14} /> Kategori: {reportData.kategori_kerusakan}
                                        </p>
                                    </div>
                                    {reportData.is_merged && (
                                        <span className="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-[9px] font-black uppercase tracking-widest text-center max-w-[100px]">
                                            Digabung ke Laporan Utama
                                        </span>
                                    )}
                                </div>

                                {/* TIMELINE VISUAL */}
                                <div className="relative pl-6 border-l-2 border-slate-100 space-y-10">

                                    {/* Langkah 1: Masuk */}
                                    <div className="relative">
                                        <div className="absolute -left-[35px] w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm ring-2 ring-blue-100"></div>
                                        <h4 className="text-sm font-black text-slate-800">Laporan Diterima</h4>
                                        <p className="text-[11px] font-bold text-slate-500 mb-2">
                                            {new Date(reportData.createdAt).toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-xs text-slate-600 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            Laporan Anda masuk ke sistem LINTAS dan sedang mengantre untuk validasi Admin.
                                        </p>
                                    </div>

                                    {/* Handling Jika Ditolak / Spam */}
                                    {['SPAM', 'DITOLAK'].includes(reportData.status.toUpperCase()) ? (
                                        <div className="relative">
                                            <div className="absolute -left-[35px] w-4 h-4 rounded-full bg-rose-500 border-4 border-white shadow-sm"></div>
                                            <h4 className="text-sm font-black text-rose-600">Laporan Ditolak / Spam</h4>
                                            <p className="text-xs text-rose-700 font-medium bg-rose-50 p-4 rounded-xl border border-rose-100 mt-2">
                                                Sistem mendeteksi anomali pada laporan (Lokasi GPS tidak cocok dengan aset) atau laporan dianggap tidak valid oleh Admin.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Langkah 2: Proses */}
                                            <div className={`relative ${['PROSES PERBAIKAN', 'DITUGASKAN', 'DIKERJAKAN', 'REVIEW_ADMIN', 'SELESAI', 'BAIK'].includes(reportData.status.toUpperCase()) ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                                                <div className={`absolute -left-[35px] w-4 h-4 rounded-full border-4 border-white shadow-sm ${['PROSES PERBAIKAN', 'DITUGASKAN', 'DIKERJAKAN', 'REVIEW_ADMIN', 'SELESAI', 'BAIK'].includes(reportData.status.toUpperCase()) ? 'bg-amber-500 ring-2 ring-amber-100' : 'bg-slate-300'}`}></div>
                                                <h4 className="text-sm font-black text-slate-800">Proses Perbaikan Lapangan</h4>
                                                <p className="text-[11px] font-bold text-slate-500 mb-2">
                                                    Tim Teknisi Dinas Perhubungan
                                                </p>
                                                <p className="text-xs text-slate-600 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    Aset teridentifikasi ({reportData.asset?.nama_aset}). Petugas lapangan telah diterjunkan untuk melakukan tindak lanjut perbaikan.
                                                </p>
                                            </div>

                                            {/* Langkah 3: Selesai */}
                                            <div className={`relative ${['SELESAI', 'BAIK'].includes(reportData.status.toUpperCase()) ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                                                <div className={`absolute -left-[35px] w-4 h-4 rounded-full border-4 border-white shadow-sm ${['SELESAI', 'BAIK'].includes(reportData.status.toUpperCase()) ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-slate-300'}`}></div>
                                                <h4 className="text-sm font-black text-emerald-600 flex items-center gap-2">
                                                    Selesai Ditangani <CheckCircle2 size={16} />
                                                </h4>
                                                {reportData.progress?.finished_at && (
                                                    <p className="text-[11px] font-bold text-slate-500 mb-2">
                                                        {new Date(reportData.progress.finished_at).toLocaleString('id-ID')}
                                                    </p>
                                                )}
                                                <p className="text-xs text-emerald-800 font-medium bg-emerald-50 p-4 rounded-xl border border-emerald-100 mt-2">
                                                    Perbaikan telah rampung dan diverifikasi oleh Admin. Terima kasih atas kepedulian Anda terhadap fasilitas jalan!
                                                </p>
                                                {/* Menampilkan foto hasil jika ada */}
                                                {reportData.progress?.foto_hasil && (
                                                    <img
                                                        src={`${import.meta.env.PROD ? window.location.origin : 'http://localhost:3000'}${reportData.progress.foto_hasil}`}
                                                        alt="Bukti Selesai"
                                                        className="mt-4 rounded-xl w-full max-h-48 object-cover border border-slate-200 shadow-sm"
                                                    />
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                                <Search size={48} className="text-slate-200 mb-4" />
                                <h3 className="text-lg font-black text-slate-400">Pilih atau Cari Tiket</h3>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}