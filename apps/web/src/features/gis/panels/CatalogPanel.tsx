// apps/web/src/features/gis/panels/CatalogPanel.tsx
import { useState, useMemo } from 'react';
import { Search, ChevronDown, FolderGit, AlertTriangle } from 'lucide-react';
import { useGisUIStore } from '@/store/useGisUIStore';
import { useActiveReports } from '@/hooks/useGisQueries';
import { useAssets } from '@/hooks/useAssetQueries';
import { mapRegistry } from '../MapControllers';

// ==========================================
// 1. KOMPONEN: KATALOG ASET
// ==========================================
export function AssetCatalogPanel() {
    const { openPanel, closePanelsToTheRight, setSelectedAssetId, selectedAssetId } = useGisUIStore();

    // Mengambil seluruh aset spasial terdaftar agar bisa dicari dan diklik untuk terbang ke peta
    const { data: assetResponse, isLoading } = useAssets(1, 1000, { is_spatial: true });
    const assets = assetResponse?.data || [];

    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    // Grouping & Filtering di sisi Klien (Sangat Cepat)
    const groupedAssets = useMemo(() => {
        const groups: Record<string, any[]> = {};
        const query = searchQuery.toLowerCase().trim();

        // Buang titik klaster, kita hanya mau me-list aset asli
        const realAssets = assets.filter((a: any) => !a.is_cluster);

        realAssets.forEach((asset: any) => {
            const matches = !query ||
                asset.nama_aset?.toLowerCase().includes(query) ||
                asset.kode_inventaris?.toLowerCase().includes(query) ||
                asset.jenis?.toLowerCase().includes(query);

            if (matches) {
                const cat = asset.kategori_nama || asset.kategori?.nama || 'Kategori Lainnya';
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(asset);
            }
        });

        return groups;
    }, [assets, searchQuery]);

    const handleAssetClick = (asset: any) => {
        const map = mapRegistry.get();
        if (map) {
            map.flyTo([asset.lat, asset.lng], 18, { animate: true });
        }
        setSelectedAssetId(asset.id);
        closePanelsToTheRight(-1);
        openPanel('detil-aset', `ID: ${asset.kode_inventaris || asset.id_asset || 'N/A'}`, asset);
    };

    return (
        <div className="flex flex-col h-full bg-white pb-6 font-sans text-left">
            {/* Search Bar Sticky */}
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={14} />
                    <input
                        type="text"
                        placeholder="Cari nama, ID, atau jenis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* List Accordion */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                        Memuat Data Spasial...
                    </div>
                ) : Object.keys(groupedAssets).length > 0 ? (
                    Object.keys(groupedAssets).map((catName) => {
                        const isExpanded = expandedCategory === catName;
                        const items = groupedAssets[catName];

                        return (
                            <div key={catName} className="flex flex-col border-b border-slate-100">
                                <button
                                    onClick={() => setExpandedCategory(isExpanded ? null : catName)}
                                    className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors w-full text-left outline-none"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        <span className="text-[10px] font-black uppercase text-slate-700 truncate tracking-wider">{catName}</span>
                                    </div>
                                    <span className="bg-slate-200 text-slate-600 font-mono text-[9px] font-black px-1.5 py-0.5 rounded shadow-inner">
                                        {items.length}
                                    </span>
                                </button>

                                {isExpanded && (
                                    <div className="flex flex-col bg-white animate-in slide-in-from-top-1">
                                        {items.map((asset) => {
                                            const isSelected = selectedAssetId === asset.id;
                                            return (
                                                <button
                                                    key={asset.id}
                                                    onClick={() => handleAssetClick(asset)}
                                                    className={`flex items-center gap-3 px-5 py-3 border-b border-slate-50 hover:bg-blue-50/50 transition-colors w-full text-left outline-none border-l-[3px] ${isSelected ? 'bg-blue-50 border-l-blue-600' : 'border-l-transparent'}`}
                                                >
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-white shadow-sm" style={{
                                                        backgroundColor: asset.kondisi?.includes('BAIK') ? '#16a34a' : asset.kondisi?.includes('RUSAK') ? '#fbbf24' : '#dc2626'
                                                    }}></span>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`text-[11px] leading-tight truncate ${isSelected ? 'font-black text-blue-700' : 'font-bold text-slate-800'}`}>
                                                            {asset.nama_aset}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                                                            {asset.kondisi?.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="p-12 text-center text-slate-400 space-y-3">
                        <FolderGit className="mx-auto opacity-50" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Aset Tidak Ditemukan</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// 2. KOMPONEN: KATALOG LAPORAN
// ==========================================
export function ReportCatalogPanel() {
    const { openPanel, closePanelsToTheRight, setSelectedReportId, selectedReportId } = useGisUIStore();
    const { data: reports = [], isLoading } = useActiveReports(true);

    const handleReportClick = (report: any) => {
        const map = mapRegistry.get();
        if (map) {
            map.flyTo([report.lat, report.lng], 18, { animate: true });
        }
        setSelectedReportId(report.id);
        closePanelsToTheRight(-1);
        openPanel('detil-laporan', `TIKET: ${report.ticket_number}`, report);
    };

    return (
        <div className="flex flex-col h-full bg-white pb-6 font-sans text-left">
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                        Memindai Radar...
                    </div>
                ) : reports.length > 0 ? (
                    reports.map((report: any) => {
                        const isSelected = selectedReportId === report.id;
                        return (
                            <button
                                key={report.id}
                                onClick={() => handleReportClick(report)}
                                className={`flex flex-col gap-2 px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors w-full text-left outline-none border-l-[3px] ${isSelected ? 'bg-blue-50/50 border-l-blue-600' : 'border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-center w-full">
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${report.sumber_pelapor === 'MASYARAKAT' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {report.sumber_pelapor}
                                    </span>
                                    <span className="text-[9px] font-mono font-bold text-slate-400">{report.ticket_number}</span>
                                </div>
                                <h4 className={`text-xs leading-tight ${isSelected ? 'font-black text-blue-700' : 'font-bold text-slate-800'}`}>
                                    {report.judul_laporan}
                                </h4>
                            </button>
                        );
                    })
                ) : (
                    <div className="p-12 text-center text-slate-400 space-y-3">
                        <AlertTriangle className="mx-auto opacity-50" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Radar Bersih</p>
                    </div>
                )}
            </div>
        </div>
    );
}