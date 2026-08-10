// apps/web/src/pages/public/Track.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CheckCircle2, AlertTriangle, FileSearch, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { api } from '@/lib/api';
import { useTicketStorage } from '@/hooks/useTicketStorage';

// Helper Utility untuk Foto Path
const getImageUrl = (path?: string) => {
    if (!path) return 'https://placehold.co/600x400/f8fafc/94a3b8?text=NO+IMAGE';
    if (path.startsWith('http')) return path;
    
    const origin = import.meta.env.PROD ? window.location.origin : 'http://localhost:3000';
    
    // Jika path sudah memiliki /uploads/
    if (path.includes('uploads/')) {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${origin}${cleanPath}`;
    }
    
    // Jika path tidak memiliki folder uploads (data seeder lama tanpa folder prefix)
    if (path.startsWith('bukti_') || path.startsWith('serah_')) {
        return `${origin}/uploads/reports/${path}`;
    }
    
    return `${origin}/uploads/assets/${path}`;
};

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
            setSearchInput('');
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col font-sans text-left pb-24">
            {/* Header Laporan */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Melacak Laporan</h1>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Cek Status Penanganan Fasilitas Jalan Secara Real-Time</p>
            </div>

            {/* Layout Utama */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Kolom Kiri: Form Cari & Riwayat Pelacakan Lokal */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Search Form */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Masukkan Kode Tiket</h3>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="CONTOH: LPT-2026..."
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 uppercase outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                className="bg-slate-900 hover:bg-blue-600 text-white p-3 rounded-xl transition-colors shadow-md active:scale-95"
                            >
                                <Search size={18} />
                            </button>
                        </form>
                    </div>

                    {/* Local Tracking History */}
                    {savedTickets.length > 0 && (
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Laporan Tersimpan</h3>
                            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto custom-scrollbar">
                                {savedTickets.map((t) => (
                                    <button
                                        key={t.ticket_number}
                                        onClick={() => setActiveTicket(t.ticket_number)}
                                        className={`w-full py-3.5 flex items-center justify-between text-left group transition-colors ${activeTicket === t.ticket_number ? 'text-blue-600 font-black' : 'text-slate-700 font-bold hover:text-blue-500'}`}
                                    >
                                        <div className="space-y-0.5">
                                            <p className="text-xs uppercase tracking-wider">{t.ticket_number}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                Dilaporkan: {new Date(t.saved_at).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                                            <FileSearch size={12} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Kolom Kanan: Timeline Real-time Progress Laporan */}
                <div className="lg:col-span-2">
                    {isLoading ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                            <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest animate-pulse">Menghubungkan ke Tracker...</h3>
                        </div>
                    ) : isError ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 shadow-sm flex flex-col items-center bg-rose-50/20">
                            <AlertTriangle className="text-rose-500 mb-4" size={32} />
                            <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-1">Pencarian Gagal</h3>
                            <p className="text-xs text-rose-500 font-semibold">{(error as any)?.message || 'Nomor tiket tidak terdaftar di sistem.'}</p>
                        </div>
                    ) : reportData ? (
                        <motion.div
                            key={reportData.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6"
                        >
                            {/* Judul & Deskripsi Aset */}
                            <div className="border-b border-slate-100 pb-5 space-y-2">
                                <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white rounded-lg shadow-sm ${reportData.status === 'SELESAI' ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'}`}>
                                    {reportData.status}
                                </span>
                                <h3 className="text-base font-black text-slate-800 leading-snug pt-1">{reportData.judul_laporan}</h3>
                                <p className="text-xs font-medium text-slate-500 italic">"{reportData.deskripsi || 'Tanpa keterangan tambahan'}"</p>
                            </div>

                            {/* TIMELINE JALUR LINTAS */}
                            <div className="relative pl-8 border-l border-slate-200 space-y-8 py-2 ml-4">
                                
                                {/* Langkah 1: Dilaporkan */}
                                <div className="relative">
                                    <div className="absolute -left-[35px] w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm ring-2 ring-blue-100"></div>
                                    <h4 className="text-sm font-black text-slate-800">Laporan Diterima Sistem</h4>
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
                                                    src={getImageUrl(reportData.progress.foto_hasil)}
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
    );
}