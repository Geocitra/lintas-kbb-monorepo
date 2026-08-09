// apps/web/src/components/ui/NotificationBell.tsx
import { useState, useRef, useEffect } from 'react';
import { Bell, X, Megaphone, ShieldAlert, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';

import { useUnreadAnnouncements, useAcknowledgeAnnouncement } from '@/hooks/useAnnouncementQueries';

export default function NotificationBell() {
    const { data: unreadItems = [] } = useUnreadAnnouncements();
    const ackMutation = useAcknowledgeAnnouncement();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Tutup panel saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleMarkRead = async (announcementId: string) => {
        try {
            await ackMutation.mutateAsync(announcementId);
            toast.success('Pengumuman ditandai sudah dibaca.');
        } catch {
            toast.error('Gagal menandai pengumuman.');
        }
    };

    const count = unreadItems.length;

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Notifikasi Pengumuman"
            >
                <Bell size={18} />
                {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full animate-pulse shadow-lg shadow-rose-200">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 max-h-[480px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[100] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Notifikasi ({count})
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {count === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <Bell size={28} className="mb-3 opacity-30" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Semua Sudah Dibaca</p>
                                <p className="text-[10px] font-medium mt-1">Tidak ada pengumuman baru.</p>
                            </div>
                        ) : (
                            unreadItems.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-3 px-5 py-4 border-b border-slate-50 hover:bg-blue-50/30 transition-colors group"
                                >
                                    {/* Icon */}
                                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${item.is_important ? 'bg-rose-50' : 'bg-blue-50'}`}>
                                        {item.is_important
                                            ? <ShieldAlert size={14} className="text-rose-500" />
                                            : <Megaphone size={14} className="text-blue-500" />
                                        }
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {item.is_important && (
                                            <span className="inline-block px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[8px] font-black uppercase tracking-widest mb-1 rounded">
                                                Penting
                                            </span>
                                        )}
                                        <h4 className="text-xs font-black text-slate-800 leading-snug truncate">
                                            {item.title}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 font-medium line-clamp-2 mt-0.5 leading-relaxed">
                                            {item.content}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-bold text-slate-400">
                                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: id })}
                                            </span>
                                            {item.author?.name && (
                                                <>
                                                    <span className="text-slate-300">·</span>
                                                    <span className="text-[9px] font-bold text-slate-400">{item.author.name}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mark Read Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleMarkRead(item.id); }}
                                        disabled={ackMutation.isPending}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shrink-0 mt-1"
                                        title="Tandai sudah dibaca"
                                    >
                                        <Check size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
