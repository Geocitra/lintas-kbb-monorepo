// apps/web/src/features/gis/ReportMarkers.tsx
import React, { useMemo } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';

import { useGisUIStore } from '@/store/useGisUIStore';
import { useActiveReports } from '@/hooks/useGisQueries';

// ==========================================
// KREATOR IKON RADAR BERKEDIP
// ==========================================
const createRadarIcon = (source: string) => {
    const isPublic = source?.toUpperCase() === 'MASYARAKAT';

    // Warga = Merah (Rose), Petugas Internal = Kuning (Amber)
    const colorClass = isPublic ? 'bg-rose-600' : 'bg-amber-500';
    const ringClass = isPublic ? 'bg-rose-500' : 'bg-amber-400';

    return L.divIcon({
        className: 'bg-transparent border-none',
        html: `
      <div class="relative w-8 h-8 flex items-center justify-center" style="transform: translate(-16px, -16px);">
        <span class="absolute inline-flex h-7 w-7 rounded-full ${ringClass} opacity-75 animate-ping"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 ${colorClass} border-2 border-white shadow-xl flex items-center justify-center">
          <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
        </span>
      </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [0, 0]
    });
};

export default function ReportMarkers() {
    const map = useMap();
    const activeLayers = useGisUIStore((state) => state.activeLayers);
    const { openPanel, setSelectedReportId } = useGisUIStore();

    // Memanggil API Laporan Cerdas (Auto-refresh setiap 30 detik dari Hook)
    const isLayerActive = activeLayers.includes('reports');
    const { data: reports = [] } = useActiveReports(isLayerActive);

    // Filter laporan gaib (tanpa koordinat)
    const activeReports = useMemo(() => {
        return reports.filter((r: any) => r.lat && r.lng);
    }, [reports]);

    const handleReportClick = (report: any) => {
        map.flyTo([report.lat, report.lng], 18, { animate: true });
        setSelectedReportId(report.id);

        // Buka panel samping
        openPanel('detil-laporan', `TIKET: ${report.ticket_number}`, report);
    };

    if (!isLayerActive) return null;

    return (
        <React.Fragment>
            {activeReports.map((report: any) => (
                <Marker
                    key={`report-${report.id}`}
                    position={[report.lat, report.lng]}
                    icon={createRadarIcon(report.sumber_pelapor)}
                    eventHandlers={{ click: () => handleReportClick(report) }}
                >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                        <div className="font-sans text-xs text-slate-800 p-1.5 space-y-1.5 text-left min-w-[160px]">
                            <div className="flex justify-between items-center gap-3 border-b border-slate-100 pb-1.5">
                                <span className={`text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider leading-none rounded-sm ${report.sumber_pelapor?.toUpperCase() === 'MASYARAKAT'
                                    ? 'text-rose-700 bg-rose-100'
                                    : 'text-amber-700 bg-amber-100'
                                    }`}>
                                    Aduan {report.sumber_pelapor}
                                </span>
                                <span className="font-mono text-[9px] font-black text-slate-400">
                                    {report.ticket_number}
                                </span>
                            </div>

                            <h4 className="font-bold text-slate-900 leading-tight">
                                {report.judul_laporan}
                            </h4>

                            <p className="text-[10px] font-medium text-slate-500 line-clamp-2 italic leading-relaxed">
                                "{report.deskripsi_keluhan || report.deskripsi || 'Tanpa Keterangan'}"
                            </p>
                        </div>
                    </Tooltip>
                </Marker>
            ))}
        </React.Fragment>
    );
}