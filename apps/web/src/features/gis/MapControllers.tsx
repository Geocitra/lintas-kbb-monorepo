// apps/web/src/features/gis/MapControllers.tsx
import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useGisUIStore } from '@/store/useGisUIStore';
import bogorKecamatan from '@/assets/geojson/bogor-kecamatan.json';

// Mengaktifkan akses map secara global (Opsional, sangat berguna untuk debugging / export image)
export const mapRegistry = {
    instance: null as any,
    set: (map: any) => { mapRegistry.instance = map; },
    get: () => mapRegistry.instance,
    clear: () => { mapRegistry.instance = null; }
};

export default function MapControllers() {
    const map = useMap();
    const setMapCenter = useGisUIStore((state) => state.setMapCenter);
    const setMapZoom = useGisUIStore((state) => state.setMapZoom);
    const setMapBounds = useGisUIStore((state) => state.setMapBounds);

    // Fit view to the bounds of the administrative GeoJSON on mount
    useEffect(() => {
        try {
            const geoJsonLayer = L.geoJSON(bogorKecamatan as any);
            map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
        } catch (e) {
            console.error('Gagal memposisikan peta ke batas wilayah:', e);
        }
    }, [map]);

    // 1. Inisialisasi Kordinat Batas Layar saat Peta pertama kali dimuat
    useEffect(() => {
        mapRegistry.set(map);

        const bounds = map.getBounds();
        setMapBounds({
            minLat: bounds.getSouth(),
            minLng: bounds.getWest(),
            maxLat: bounds.getNorth(),
            maxLng: bounds.getEast()
        });

        return () => mapRegistry.clear();
    }, [map, setMapBounds]);

    // 2. Mendengarkan aksi User (Geser dan Zoom)
    // moveend akan terpicu ketika user MELEPAS klik-tahannya (jadi tidak spam update)
    useMapEvents({
        moveend: () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            const bounds = map.getBounds();

            // Update Zustand State secara senyap
            setMapCenter([center.lat, center.lng]);
            setMapZoom(zoom);
            setMapBounds({
                minLat: bounds.getSouth(),
                minLng: bounds.getWest(),
                maxLat: bounds.getNorth(),
                maxLng: bounds.getEast()
            });
        },
        // Event zoom tambahan jika dibutuhkan
        zoomend: () => {
            setMapZoom(map.getZoom());
        }
    });

    // 3. Mendengarkan Perintah dari Tombol UI di luar Peta (Event Listener Murni)
    useEffect(() => {
        const handleZoomIn = () => map.zoomIn();
        const handleZoomOut = () => map.zoomOut();
        const handleResetView = () => map.setView([-6.8431, 107.4912], 11, { animate: true, duration: 1.2 });

        const handleFlyToCoords = (e: any) => {
            const { lat, lng, zoom } = e.detail;
            if (lat && lng) {
                map.setView([lat, lng], zoom || 16, { animate: true });
            }
        };

        window.addEventListener('map-zoom-in', handleZoomIn);
        window.addEventListener('map-zoom-out', handleZoomOut);
        window.addEventListener('map-reset-view', handleResetView);
        window.addEventListener('map-fly-to-coords', handleFlyToCoords);

        return () => {
            window.removeEventListener('map-zoom-in', handleZoomIn);
            window.removeEventListener('map-zoom-out', handleZoomOut);
            window.removeEventListener('map-reset-view', handleResetView);
            window.removeEventListener('map-fly-to-coords', handleFlyToCoords);
        };
    }, [map]);

    // Komponen ini tidak memiliki tampilan UI
    return null;
}