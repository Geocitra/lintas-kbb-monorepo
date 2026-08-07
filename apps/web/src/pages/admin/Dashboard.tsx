// apps/web/src/pages/admin/Dashboard.tsx
import { BarChart3, Download, Layers } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Dashboard Eksekutif</h1>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        (Placeholder Fase 1) Area analitik, Chart.js, dan Stream PDF/Excel.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-rose-50 text-rose-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-50 cursor-not-allowed">
                        <Download size={14} /> PDF
                    </button>
                    <button className="px-4 py-2 bg-emerald-50 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-50 cursor-not-allowed">
                        <Download size={14} /> Excel
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
                        <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse"></div>
                        <div className="space-y-2">
                            <div className="w-16 h-6 bg-slate-100 rounded-md animate-pulse"></div>
                            <div className="w-24 h-3 bg-slate-50 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center p-8">
                    <div className="text-center text-slate-300 flex flex-col items-center">
                        <BarChart3 size={48} className="mb-4 opacity-50" />
                        <p className="text-xs font-black uppercase tracking-widest">Chart Placeholder</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center p-8">
                    <div className="text-center text-slate-300 flex flex-col items-center">
                        <Layers size={48} className="mb-4 opacity-50" />
                        <p className="text-xs font-black uppercase tracking-widest">Distribution Placeholder</p>
                    </div>
                </div>
            </div>
        </div>
    );
}