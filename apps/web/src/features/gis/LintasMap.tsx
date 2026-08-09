// apps/web/src/features/gis/LintasMap.tsx
import { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useGisUIStore } from '@/store/useGisUIStore';
import { useBoundaries } from '@/hooks/useGisQueries';
import { useAuthStore } from '@/store/useAuthStore';
import MapControllers from './MapControllers';
import AssetMarkers from './AssetMarkers';
import ReportMarkers from './ReportMarkers';
// Fix untuk Leaflet Default Icon issue di Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function LintasMap() {
    const { user } = useAuthStore();
    const activeBaseMap = useGisUIStore((state) => state.activeBaseMap);
    const mapOpacity = useGisUIStore((state) => state.mapOpacity);
    const activeLayers = useGisUIStore((state) => state.activeLayers);

    // 2. KUNCI POSISI AWAL (Mencegah Infinite Re-render)
    // useMemo memastikan nilai ini tidak pernah berubah meskipun state mapCenter di zustand berubah
    const initialCenter = useMemo(() => useGisUIStore.getState().mapCenter, []);
    const initialZoom = useMemo(() => useGisUIStore.getState().mapZoom, []);

    // 3. Panggil API GeoJSON dengan TanStack Query (Akan menembak endpoint /spatial/boundaries?zoom=X)
    // Hanya dipanggil jika layer "boundaries" aktif.
    const isBoundariesActive = activeLayers.includes('boundaries');
    const currentZoom = useGisUIStore((state) => state.mapZoom); // Butuh zoom untuk downsampling

    const {
        data: geoJsonData,
        isLoading: isGeoLoading
    } = useBoundaries(currentZoom, isBoundariesActive);

    // 4. Pilih URL Peta Dasar (Base Map)
    const tileUrl = useMemo(() => {
        switch (activeBaseMap) {
            case 'satellite':
                return 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
            case 'dark':
                return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
            case 'street':
            case 'light':
            default:
                return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        }
    }, [activeBaseMap]);

    // 5. Tema Poligon Batas Desa
    const geoJsonStyle = useMemo(() => ({
        color: activeBaseMap === 'dark' ? '#00e5ff' : '#2563eb', // Border Biru Neon/Tua
        weight: 1.5,
        fillColor: activeBaseMap === 'dark' ? '#0f172a' : '#000000',
        // Menggunakan slider opacity dari UI Store (skala 0 - 100)
        fillOpacity: isBoundariesActive ? (mapOpacity / 100) * 0.4 : 0,
        opacity: isBoundariesActive ? 0.6 : 0
    }), [activeBaseMap, mapOpacity, isBoundariesActive]);

    return (
        <div className="w-full h-full relative z-0 overflow-hidden bg-slate-900">

            {/* Loading Overlay Keren saat Unduh Peta Desa */}
            {isGeoLoading && isBoundariesActive && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999]">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl text-center space-y-4 flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] text-slate-800 font-black uppercase tracking-[0.2em] animate-pulse">
                            Memuat Peta Tata Ruang KBB...
                        </p>
                    </div>
                </div>
            )}

            {/* Mesin Peta */}
            <MapContainer
                center={initialCenter}
                zoom={initialZoom}
                zoomControl={false} // Dimatikan karena kita akan membuat HUD Zoom sendiri
                className="w-full h-full"
                maxZoom={18}
                minZoom={8}
            >
                {/* Penjaga Event & Sync Kordinat */}
                <MapControllers />

                {/* Lapisan Visual Bawah */}
                <TileLayer
                    url={tileUrl}
                    attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                />

                {/* Lapisan Poligon Batas KBB (Dirender jika data sudah tiba) */}
                {geoJsonData && geoJsonData.features && isBoundariesActive && (
                    <GeoJSON
                        // Key ini penting agar Leaflet me-render ulang poligon jika level zoom berubah drastis (Downsampling update)
                        key={`boundaries-layer-${currentZoom < 12 ? 'low' : 'high'}-${activeBaseMap}`}
                        data={geoJsonData}
                        style={geoJsonStyle}
                        interactive={false} // Matikan klik pada poligon agar tidak mengganggu klik marker
                    />
                )}
                {/* Lapisan Titik Aset & Laporan */}
                {activeLayers.includes('assets') && <AssetMarkers />}
                {activeLayers.includes('reports') && user?.role && ['ADMIN', 'KADIS', 'KASI'].includes(user.role) && <ReportMarkers />}

            </MapContainer>
        </div>
    );
}