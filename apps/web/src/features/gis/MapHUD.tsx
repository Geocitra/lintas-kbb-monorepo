// apps/web/src/features/gis/MapHUD.tsx
import { Plus, Minus, Maximize2, Compass, Layers } from 'lucide-react';
import { useGisUIStore } from '@/store/useGisUIStore';
import { useAuthStore } from '@/store/useAuthStore';

// ==========================================
// 1. KOMPONEN: PELACAK KORDINAT (GPS TRACKER)
// ==========================================
export function CoordinateTracker() {
    const mapCenter = useGisUIStore((state) => state.mapCenter);
    const mapZoom = useGisUIStore((state) => state.mapZoom);

    return (
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/80 px-4 py-3 flex items-center gap-3 text-left shadow-xl rounded-2xl w-56 select-none transition-all">
            <Compass size={16} className="text-blue-600 animate-pulse shrink-0" />
            <div className="flex flex-col font-mono text-[10px] font-bold text-slate-700 leading-tight">
                <span className="text-[8px] font-sans font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                    Satelit Tracker
                </span>
                <span className="block">
                    LAT: {mapCenter[0].toFixed(5)}
                </span>
                <span className="block">
                    LNG: {mapCenter[1].toFixed(5)}
                </span>
                <span className="text-[8px] text-blue-600 font-sans font-black uppercase tracking-widest mt-1 block">
                    ZOOM LEVEL: {mapZoom}
                </span>
            </div>
        </div>
    );
}

// ==========================================
// 2. KOMPONEN: KENDALI ZOOM (HUD CONTROLS)
// ==========================================
export function ZoomControls() {
    // Memicu Event Listener yang dipasang di MapControllers.tsx
    const triggerZoomIn = () => window.dispatchEvent(new Event('map-zoom-in'));
    const triggerZoomOut = () => window.dispatchEvent(new Event('map-zoom-out'));
    const triggerResetView = () => window.dispatchEvent(new Event('map-reset-view'));

    return (
        <div className="pointer-events-auto flex flex-col bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl rounded-2xl overflow-hidden divide-y divide-slate-100 select-none text-slate-800">
            <button
                onClick={triggerZoomIn}
                className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors active:bg-blue-100 outline-none"
                title="Perbesar Peta"
            >
                <Plus size={20} strokeWidth={2.5} />
            </button>

            <button
                onClick={triggerResetView}
                className="w-12 h-12 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors active:bg-blue-100 group outline-none"
                title="Reset ke KBB"
            >
                <Maximize2 size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
            </button>

            <button
                onClick={triggerZoomOut}
                className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors active:bg-blue-100 outline-none"
                title="Perkecil Peta"
            >
                <Minus size={20} strokeWidth={2.5} />
            </button>
        </div>
    );
}

// ==========================================
// 3. KOMPONEN: LEGENDA SPASIAL (DYNAMIC LEGEND)
// ==========================================
export function SpatialLegend() {
    const { user } = useAuthStore();
    const activeLayers = useGisUIStore((state) => state.activeLayers);

    const hasAssetsActive = activeLayers.includes('assets');
    const canSeeReports = !!(user?.role && ['KADIS', 'KASI'].includes(user.role));
    const hasReportsActive = activeLayers.includes('reports') && canSeeReports;

    // Menyembunyikan legenda jika layer tidak aktif
    if (!hasAssetsActive && !hasReportsActive) return null;

    return (
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl rounded-2xl w-56 animate-in fade-in slide-in-from-bottom-4 flex flex-col font-sans select-none overflow-hidden text-left">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                <Layers size={14} className="text-blue-600" />
                <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">
                    Legenda Peta
                </h4>
            </div>

            <div className="p-4 space-y-4">
                {hasAssetsActive && (
                    <div className="space-y-2.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Kondisi Aset Dishub</span>
                        <div className="space-y-2">
                            {[
                                { label: 'Aset Baik', color: '#16a34a' },
                                { label: 'Aset Rusak', color: '#fbbf24' },
                                { label: 'Kritis / Hilang', color: '#dc2626' },
                                { label: 'Proses Perbaikan', color: '#3b82f6' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full border-2 border-white shadow-sm shrink-0" style={{ backgroundColor: item.color }}></span>
                                    <span className="text-[10px] font-bold text-slate-600 leading-none">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {hasReportsActive && (
                    <div className={`space-y-2.5 ${hasAssetsActive ? 'pt-3 border-t border-slate-100' : ''}`}>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Radar Aduan</span>
                        <div className="space-y-2">
                            {[
                                { label: 'Laporan Masyarakat', color: '#e11d48' },
                                { label: 'Temuan Petugas', color: '#f59e0b' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                                        <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ backgroundColor: item.color }}></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 border border-white" style={{ backgroundColor: item.color }}></span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 leading-none">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}