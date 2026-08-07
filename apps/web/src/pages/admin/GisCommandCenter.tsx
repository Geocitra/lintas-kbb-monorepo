// apps/web/src/pages/admin/GisCommandCenter.tsx
import { useEffect } from 'react';
import LintasMap from '@/features/gis/LintasMap';
import PanelOrchestrator from '@/features/gis/PanelOrchestrator';
import { CoordinateTracker, ZoomControls, SpatialLegend } from '@/features/gis/MapHUD';
// Catatan: Karena fitur Panel sudah kita pisah ke CatalogPanel & DetailEntityPanel, 
// pastikan Anda sudah mengimpornya di PanelOrchestrator.tsx seperti yang saya infokan di prompt sebelumnya.

export default function GisCommandCenter() {

    // (Opsional) Efek sapaan saat masuk pertama kali
    useEffect(() => {
        console.log('✅ [GIS Engine] Booting PostGIS Spasial Renderer...');
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden select-none">

            {/* 1. LAPISAN DASAR: Peta Leaflet (Z-0) */}
            <div className="absolute inset-0 z-0">
                <LintasMap />
            </div>

            {/* 2. LAPISAN TENGAH: Laci Panel dari Kiri (Z-30) */}
            <div className="absolute top-0 bottom-0 left-0 z-30 pointer-events-none">
                <PanelOrchestrator />
            </div>

            {/* 3. LAPISAN ATAS: Head-Up Display Controls (Z-40) */}
            <div className="absolute bottom-6 right-6 z-40 pointer-events-none flex flex-row items-end gap-4">

                {/* Kolom Kiri HUD: Kordinat & Legenda */}
                <div className="flex flex-col gap-4">
                    <CoordinateTracker />
                    <SpatialLegend />
                </div>

                {/* Kolom Kanan HUD: Zoom Controls */}
                <div className="flex flex-col">
                    <ZoomControls />
                </div>

            </div>

        </div>
    );
}