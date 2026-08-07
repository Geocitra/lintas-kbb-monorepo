// apps/web/src/features/gis/PanelOrchestrator.tsx
import { X, Info } from 'lucide-react';
import { useGisUIStore } from '@/store/useGisUIStore';

// Mengimpor Panel-panel yang ada
import LayerControlPanel from './panels/LayerControlPanel';
import { AssetCatalogPanel, ReportCatalogPanel } from './panels/CatalogPanel';
import { DetailAssetPanel, DetailReportPanel } from './panels/DetailEntityPanel';

const PANEL_WIDTH = 320; // Lebar standar panel 320px

export default function PanelOrchestrator() {
    const activePanels = useGisUIStore((state) => state.activePanels);
    const closePanel = useGisUIStore((state) => state.closePanel);
    const closePanelsToTheRight = useGisUIStore((state) => state.closePanelsToTheRight);

    const renderPanelContent = (panel: any) => {
        switch (panel.type) {
            case 'konfigurasi':
                return <LayerControlPanel />;

            case 'tentang':
                return (
                    <div className="p-6 text-left space-y-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                            <Info size={24} />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">LINTAS KBB GIS</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Layanan Inventaris & Sistem Tata Aset KBB adalah instrumen geospasial taktis milik Dinas Perhubungan untuk memantau inventaris jalan secara real-time.
                        </p>
                        <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mt-6">
                            Versi 5.0 (React + PostGIS)
                        </div>
                    </div>
                );

            case 'katalog-aset':
                return <AssetCatalogPanel />;
            case 'katalog-laporan':
                return <ReportCatalogPanel />;
            case 'detil-aset':
                return <DetailAssetPanel data={panel.data} />;
            case 'detil-laporan':
                return <DetailReportPanel data={panel.data} />;

            default:
                return <div className="p-6 text-xs text-rose-500">Panel tidak dikenal.</div>;
        }
    };

    return (
        <div className="relative h-full w-full flex items-start pointer-events-none">
            {activePanels.map((panel, index) => {
                // Logika penumpukan posisi layar (X Offset)
                const isFloating = panel.type.includes('detil-');
                const xOffset = index * PANEL_WIDTH;

                return (
                    <div
                        key={panel.id}
                        className={`absolute pointer-events-auto h-full bg-white flex flex-col transition-all duration-300 ease-out select-none
              ${isFloating ? 'shadow-2xl border-r border-slate-200 z-[100]' : 'border-r border-slate-200 shadow-md'}
            `}
                        style={{
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${PANEL_WIDTH}px`,
                            transform: `translateX(${xOffset}px)`,
                            zIndex: 40 - index // Panel awal ada di atas, yang baru muncul di bawahnya (sliding dari samping)
                        }}
                    >
                        {/* Header Panel */}
                        <div className="px-5 h-16 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
                            <div className="flex flex-col text-left min-w-0 pr-4">
                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">
                                    {panel.type.replace('-', ' ')}
                                </span>
                                <h3 className="text-sm font-bold text-slate-800 truncate leading-none">
                                    {panel.title}
                                </h3>
                            </div>

                            <button
                                onClick={() => closePanel(panel.id)}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors active:scale-95 outline-none shrink-0"
                            >
                                <X size={16} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Area Konten Panel */}
                        <div
                            className="flex-1 overflow-y-auto custom-scrollbar bg-white"
                            onClick={() => !isFloating && closePanelsToTheRight(index)}
                        >
                            {renderPanelContent(panel)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}