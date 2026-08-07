// apps/web/src/pages/admin/Dashboard.tsx
import {
    BarChart3, Download, Layers, ShieldAlert, CheckCircle2,
    Wrench, AlertTriangle, Loader2
} from 'lucide-react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';

import { useDashboardStats, useExportExcel, useExportPdf } from '@/hooks/useDashboardQueries';

// Registrasi modul Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
    // Tarik data analitik
    const { data: statsData, isLoading } = useDashboardStats();

    // Hook Export Generator
    const exportExcel = useExportExcel();
    const exportPdf = useExportPdf();

    const handleExportExcel = async () => {
        toast.loading('Menyiapkan file Excel...', { id: 'export-excel' });
        try {
            await exportExcel.mutateAsync();
            toast.success('File Excel berhasil diunduh!', { id: 'export-excel' });
        } catch (error) {
            toast.error('Gagal mengunduh Excel.', { id: 'export-excel' });
        }
    };

    const handleExportPdf = async () => {
        toast.loading('Merakit dokumen PDF...', { id: 'export-pdf' });
        try {
            await exportPdf.mutateAsync();
            toast.success('Dokumen PDF berhasil diunduh!', { id: 'export-pdf' });
        } catch (error) {
            toast.error('Gagal mengunduh PDF.', { id: 'export-pdf' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center text-slate-400">
                    <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Menghitung Agregasi Data...</p>
                </div>
            </div>
        );
    }

    const stats = statsData?.data;

    // Konfigurasi Chart Kondisi Aset (Doughnut)
    const conditionLabels = stats?.charts?.kondisi?.map((item: any) => item.label.replace('_', ' ')) || [];
    const conditionValues = stats?.charts?.kondisi?.map((item: any) => item.value) || [];
    const conditionColors = stats?.charts?.kondisi?.map((item: any) => {
        if (item.label.includes('BAIK')) return '#10b981'; // Emerald
        if (item.label.includes('RUSAK')) return '#f59e0b'; // Amber
        if (item.label.includes('KRITIS')) return '#ef4444'; // Rose
        if (item.label.includes('PERBAIKAN')) return '#3b82f6'; // Blue
        return '#64748b'; // Slate
    }) || [];

    const doughnutData = {
        labels: conditionLabels,
        datasets: [{
            data: conditionValues,
            backgroundColor: conditionColors,
            borderWidth: 0,
            hoverOffset: 10,
        }]
    };

    // Konfigurasi Chart Kategori (Bar)
    const categoryLabels = stats?.charts?.kategori?.map((item: any) => item.kategori) || [];
    const categoryValues = stats?.charts?.kategori?.map((item: any) => item.total) || [];

    const barData = {
        labels: categoryLabels,
        datasets: [{
            label: 'Jumlah Aset',
            data: categoryValues,
            backgroundColor: '#3b82f6',
            borderRadius: 6,
        }]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
    };

    return (
        <div className="flex flex-col min-h-full w-full animate-in fade-in duration-300 pb-10">

            {/* HEADER & EXPORT ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Dashboard Eksekutif</h1>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Ringkasan data analitik operasional LINTAS Kabupaten Bandung Barat.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportPdf}
                        disabled={exportPdf.isPending}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                    >
                        {exportPdf.isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} PDF
                    </button>
                    <button
                        onClick={handleExportExcel}
                        disabled={exportExcel.isPending}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                    >
                        {exportExcel.isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Excel
                    </button>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center"><Layers size={24} className="text-slate-600" /></div>
                        <span className="text-[10px] font-black text-slate-400 tracking-widest">TOTAL ASET</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-800">{stats?.overview?.total_aset?.toLocaleString('id-ID') || 0}</h2>
                </div>

                <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center"><CheckCircle2 size={24} className="text-emerald-600" /></div>
                        <span className="text-[10px] font-black text-emerald-600 tracking-widest">ASET BAIK</span>
                    </div>
                    <h2 className="text-4xl font-black text-emerald-600">
                        {stats?.charts?.kondisi?.find((i: any) => i.label === 'BAIK')?.value || 0}
                    </h2>
                </div>

                <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center"><Wrench size={24} className="text-blue-600" /></div>
                        <span className="text-[10px] font-black text-blue-600 tracking-widest">PERBAIKAN</span>
                    </div>
                    <h2 className="text-4xl font-black text-blue-600">
                        {stats?.charts?.kondisi?.find((i: any) => i.label === 'DALAM_PERBAIKAN')?.value || 0}
                    </h2>
                </div>

                <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center animate-pulse"><ShieldAlert size={24} className="text-rose-600" /></div>
                        <span className="text-[10px] font-black text-rose-600 tracking-widest">KRITIS</span>
                    </div>
                    <h2 className="text-4xl font-black text-rose-600">
                        {(stats?.charts?.kondisi?.find((i: any) => i.label === 'KRITIS')?.value || 0) +
                            (stats?.charts?.kondisi?.find((i: any) => i.label === 'HILANG')?.value || 0)}
                    </h2>
                </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* BAR CHART */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BarChart3 className="text-blue-600" size={16} /> Distribusi Kategori
                    </h3>
                    <div className="h-64 w-full relative">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>

                {/* DOUGHNUT CHART */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 text-center">
                        Status Operasional
                    </h3>
                    <div className="flex-1 relative flex items-center justify-center min-h-[200px]">
                        <Doughnut
                            data={doughnutData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10, family: 'Inter' } } } },
                                cutout: '70%'
                            }}
                        />
                    </div>
                </div>

            </div>

            {/* CRITICAL ASSETS TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-rose-50/50">
                    <AlertTriangle className="text-rose-500" size={18} />
                    <h3 className="text-xs font-black text-rose-800 uppercase tracking-widest">Top 10 Aset Paling Kritis & Hilang</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                            <tr>
                                <th className="p-4">KODE / NAMA ASET</th>
                                <th className="p-4">KATEGORI</th>
                                <th className="p-4">UPDATE TERAKHIR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                            {stats?.critical_assets?.length > 0 ? stats.critical_assets.map((asset: any) => (
                                <tr key={asset.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <span className="text-rose-600 block">{asset.nama_aset}</span>
                                        <span className="text-[10px] text-slate-400 font-mono tracking-widest">{asset.kode_inventaris || asset.id_asset}</span>
                                    </td>
                                    <td className="p-4 text-[10px]">{asset.kategori?.nama}</td>
                                    <td className="p-4 text-[10px] text-slate-500">{new Date(asset.updatedAt).toLocaleDateString('id-ID')}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} className="p-8 text-center text-slate-400 font-medium">Tidak ada aset dalam kondisi kritis. Semua aman.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}