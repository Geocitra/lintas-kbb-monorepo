// apps/web/src/pages/shared/Pengumuman.tsx
// Halaman feed pengumuman untuk SEMUA role yang sudah login
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Bell, Megaphone, ShieldAlert, Clock, Users } from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncementQueries';

export default function Pengumuman() {
    const { data: resData, isLoading } = useAnnouncements();
    const announcements = (resData as any)?.data || [];

    return (
        <div className="flex flex-col min-h-full w-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <Bell size={22} className="text-blue-600" />
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                        Pengumuman
                    </h1>
                </div>
                <p className="text-slate-500 text-xs font-medium mt-1">
                    Informasi resmi dari pimpinan dan manajemen Dinas Perhubungan KBB.
                </p>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-slate-200 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && announcements.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <Bell size={40} className="mb-4 opacity-30" />
                    <p className="text-sm font-bold uppercase tracking-widest">Belum Ada Pengumuman</p>
                    <p className="text-xs mt-2">Pengumuman dari pimpinan akan muncul di sini.</p>
                </div>
            )}

            {/* Feed Pengumuman */}
            <div className="flex flex-col gap-4">
                {announcements.map((item: any) => (
                    <div
                        key={item.id}
                        className={`bg-white border-l-4 shadow-sm p-6 transition-all hover:shadow-md
                            ${item.is_important
                                ? 'border-l-rose-500 border border-rose-100'
                                : 'border-l-blue-500 border border-slate-200'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-2 shrink-0 ${item.is_important ? 'bg-rose-50' : 'bg-blue-50'}`}>
                                    {item.is_important
                                        ? <ShieldAlert size={18} className="text-rose-600" />
                                        : <Megaphone size={18} className="text-blue-600" />
                                    }
                                </div>
                                <div className="min-w-0">
                                    {item.is_important && (
                                        <span className="inline-block px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest mb-2">
                                            PENTING
                                        </span>
                                    )}
                                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                        {item.title}
                                    </h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                                    <Users size={10} />
                                    {item.target || 'SEMUA'}
                                </span>
                            </div>
                        </div>

                        <p className="mt-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {item.content}
                        </p>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <Clock size={11} />
                            <span>
                                {format(new Date(item.created_at || item.createdAt), 'EEEE, dd MMMM yyyy — HH:mm', { locale: id })}
                            </span>
                            {item.author?.name && (
                                <>
                                    <span className="mx-1">·</span>
                                    <span>{item.author.name}</span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
