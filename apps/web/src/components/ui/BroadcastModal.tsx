// apps/web/src/components/ui/BroadcastModal.tsx
import { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, Megaphone, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { useUnreadAnnouncements, useAcknowledgeAnnouncement } from '@/hooks/useAnnouncementQueries';

export default function BroadcastModal() {
    // 1. Tarik pengumuman darurat (Akan otomatis mem-polling setiap 60 detik di background)
    const { data: urgentAnnouncements = [] } = useUnreadAnnouncements();
    const ackMutation = useAcknowledgeAnnouncement();

    // State untuk menampung pengumuman yang sedang ditampilkan (Satu per satu jika ada banyak)
    const [activeAnnouncement, setActiveAnnouncement] = useState<any | null>(null);

    // Jika ada pengumuman masuk, tampilkan yang pertama
    useEffect(() => {
        if (urgentAnnouncements.length > 0 && !activeAnnouncement) {
            setActiveAnnouncement(urgentAnnouncements[0]);
        }
    }, [urgentAnnouncements, activeAnnouncement]);

    const handleAcknowledge = async () => {
        if (!activeAnnouncement) return;
        try {
            // 2. Tembak API Read Receipt
            await ackMutation.mutateAsync(activeAnnouncement.id);

            // 3. Hapus dari layar. Jika masih ada pengumuman lain, ia akan muncul kembali.
            setActiveAnnouncement(null);
            toast.success('Konfirmasi baca berhasil dikirim ke sistem.');
        } catch (error: any) {
            toast.error('Gagal mengirim konfirmasi. Silakan coba lagi.');
        }
    };

    return (
        <AnimatePresence>
            {activeAnnouncement && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-hidden">

                    {/* Overlay Gelap dengan Blur Ekstrim (Mencegah interaksi di latar belakang) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                    />

                    {/* Kartu Modal Utama */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-white w-full max-w-2xl max-h-full rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
                    >
                        {/* Header Pengumuman */}
                        <div className="bg-rose-600 px-6 sm:px-8 py-6 shrink-0 flex items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-inner">
                                <Megaphone className="text-rose-600 animate-pulse" size={24} />
                            </div>
                            <div className="text-white pt-1">
                                <span className="inline-block px-3 py-1 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-widest mb-2 border border-white/30">
                                    Instruksi Eksekutif Prioritas
                                </span>
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                                    {activeAnnouncement.title}
                                </h2>
                            </div>
                        </div>

                        {/* Isi Pengumuman */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 bg-slate-50">
                            <div className="prose prose-sm sm:prose-base max-w-none text-slate-700 leading-relaxed font-medium">
                                {/* Mengubah \n dari database menjadi <br/> di HTML */}
                                {activeAnnouncement.content.split('\n').map((line: string, i: number) => (
                                    <span key={i}>
                                        {line}
                                        <br />
                                    </span>
                                ))}
                            </div>

                            {/* Data Meta */}
                            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-bold text-slate-500">
                                <div className="flex items-center gap-2">
                                    <AlertOctagon size={16} className="text-amber-500" />
                                    Pesan dari: KEPALA DINAS PERHUBUNGAN
                                </div>
                                <div className="text-slate-400">
                                    Dikirim pada: {new Date(activeAnnouncement.createdAt).toLocaleString('id-ID')}
                                </div>
                            </div>
                        </div>

                        {/* Aksi "Saya Mengerti" */}
                        <div className="p-6 sm:p-8 bg-white border-t border-slate-100 shrink-0">
                            <p className="text-center text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4">
                                Layar dikunci hingga Anda mengkonfirmasi instruksi ini
                            </p>
                            <button
                                onClick={handleAcknowledge}
                                disabled={ackMutation.isPending}
                                className="w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {ackMutation.isPending ? (
                                    <><Loader2 className="animate-spin" size={20} /> Mencatat Tanda Terima...</>
                                ) : (
                                    <><CheckCircle2 size={20} /> Saya Mengerti & Siap Melaksanakan</>
                                )}
                            </button>
                        </div>
                    </motion.div>

                </div>
            )}
        </AnimatePresence>
    );
}