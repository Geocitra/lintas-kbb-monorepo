// apps/web/src/pages/kadis/KadisDashboard.tsx
// Dashboard Eksekutif — Ruang Komando Kepala Dinas
import { BarChart2, TrendingUp, AlertTriangle, CheckCircle, Clock, FileText, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardQueries';

interface StatCardProps {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    color: 'blue' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
    blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    border: 'border-blue-200'   },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-200' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-amber-200'  },
    rose:    { bg: 'bg-rose-50',    icon: 'text-rose-600',    border: 'border-rose-200'   },
};

function StatCard({ label, value, sub, icon, color }: StatCardProps) {
    const c = colorMap[color];
    return (
        <div className={`bg-white border ${c.border} p-6 shadow-sm`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                    <p className="text-3xl font-black text-slate-800">{value}</p>
                    {sub && <p className="text-xs text-slate-500 mt-1 font-medium">{sub}</p>}
                </div>
                <div className={`p-3 ${c.bg}`}>
                    <span className={c.icon}>{icon}</span>
                </div>
            </div>
        </div>
    );
}

export default function KadisDashboard() {
    const { data: stats, isLoading } = useDashboardStats();

    const kpiCards: StatCardProps[] = [
        {
            label: 'Total Laporan Masuk',
            value: isLoading ? '—' : (stats?.totalReports ?? 0),
            sub: 'Aduan dari masyarakat',
            icon: <FileText size={22} />,
            color: 'blue',
        },
        {
            label: 'Tiket Aktif',
            value: isLoading ? '—' : (stats?.activeTickets ?? 0),
            sub: 'Sedang dalam penanganan',
            icon: <Clock size={22} />,
            color: 'amber',
        },
        {
            label: 'Selesai Bulan Ini',
            value: isLoading ? '—' : (stats?.completedThisMonth ?? 0),
            sub: 'Tiket berhasil diselesaikan',
            icon: <CheckCircle size={22} />,
            color: 'emerald',
        },
        {
            label: 'SLA Terlampaui',
            value: isLoading ? '—' : (stats?.slaBreached ?? 0),
            sub: 'Perlu perhatian segera',
            icon: <AlertTriangle size={22} />,
            color: 'rose',
        },
    ];

    return (
        <div className="flex flex-col min-h-full w-full animate-in fade-in duration-300">

            {/* HEADER EKSEKUTIF */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-600">
                        <BarChart2 size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                            Ruang Komando
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Executive Dashboard — Dinas Perhubungan KBB
                        </p>
                    </div>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {kpiCards.map(card => <StatCard key={card.label} {...card} />)}
            </div>

            {/* AKSI CEPAT EKSEKUTIF */}
            <div className="mb-8">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Aksi Cepat
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link to="/gis" className="flex items-center gap-4 p-5 bg-slate-800 text-white hover:bg-slate-700 transition-colors group">
                        <div className="p-3 bg-blue-600 group-hover:bg-blue-500 transition-colors">
                            <Map size={20} />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-tight">Buka Peta Spasial</p>
                            <p className="text-slate-400 text-xs mt-0.5">Pantau kondisi infrastruktur real-time</p>
                        </div>
                    </Link>
                    <Link to="/pengumuman/create" className="flex items-center gap-4 p-5 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
                        <div className="p-3 bg-amber-50 group-hover:bg-amber-100 transition-colors">
                            <TrendingUp size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="font-black text-sm text-slate-800 uppercase tracking-tight">Buat Pengumuman</p>
                            <p className="text-slate-400 text-xs mt-0.5">Siarkan informasi ke seluruh staf</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* CATATAN BISNIS */}
            <div className="bg-blue-950 border border-blue-900 p-6">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
                    Informasi Role
                </p>
                <p className="text-blue-200 text-sm leading-relaxed">
                    Sebagai <strong className="text-white">Kepala Dinas</strong>, Anda memiliki akses monitoring dan komando strategis.
                    Manajemen operasional teknis (aset, audit, user) dikelola oleh tim <strong className="text-white">Admin Sistem</strong>.
                    Gunakan Peta Spasial untuk pantauan lapangan dan Pengumuman untuk komunikasi ke seluruh staf.
                </p>
            </div>
        </div>
    );
}
