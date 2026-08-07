// apps/web/src/hooks/useGisQueries.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { MapBounds } from '@/store/useGisUIStore';

// ==========================================
// 1. QUERY: BATAS ADMINISTRASI DESA (GeoJSON 5MB -> KB)
// ==========================================
export const useBoundaries = (zoom: number, isEnabled: boolean) => {
    return useQuery({
        // QueryKey bergantung pada zoom. Jika zoom berubah (misal dari 11 ke 15), 
        // akan memanggil API lagi untuk mendapat poligon yang lebih detail (Downsampling)
        queryKey: ['gis_boundaries', zoom],
        queryFn: async () => {
            // NOTE: Endpoint ini sudah dibuat di Backend Fase 3 (SpatialController)
            const res: any = await api.get('/spatial/boundaries', {
                params: { zoom }
            });
            // Di Backend, controller mengirim raw GeoJSON (bukan dibungkus Response Wrapper)
            return res;
        },
        enabled: isEnabled, // Hanya fetch jika toggle layer boundaries aktif
        staleTime: Infinity, // Poligon desa tidak akan berubah, simpan di memori selamanya
    });
};

// ==========================================
// 2. QUERY: ASET DALAM VIEWPORT (Marker & Cluster)
// ==========================================
export const useViewportAssets = (bounds: MapBounds | null, zoom: number, isEnabled: boolean) => {
    return useQuery({
        // Cache akan menyimpan kordinat wilayah (Bounds). Jika user geser peta lalu kembali 
        // ke lokasi semula, titik akan muncul instan dari Cache!
        queryKey: ['gis_assets', bounds?.minLat, bounds?.minLng, zoom],
        queryFn: async () => {
            if (!bounds) return [];

            // CATATAN ARSITEKTURAL UNTUK KITA NANTI:
            // Kita perlu membuat endpoint GET /api/v1/spatial/viewport di backend 
            // yang mengarahkan ke SpatialService.getAssetsInViewport(minLat, minLng, maxLat, maxLng, zoom)
            // Sementara menggunakan /assets standar dengan params untuk filter.
            const res: any = await api.get('/spatial/viewport', {
                params: { ...bounds, zoom }
            });

            return res.data || [];
        },
        enabled: !!bounds && isEnabled,
        staleTime: 60 * 1000, // Data aset dianggap segar selama 1 menit (Mencegah DDOS API)
    });
};

// ==========================================
// 3. QUERY: RADAR LAPORAN WARGA (Real-time Polling)
// ==========================================
export const useActiveReports = (isEnabled: boolean) => {
    return useQuery({
        queryKey: ['gis_active_reports'],
        queryFn: async () => {
            // Mengambil laporan yang belum selesai untuk dirender sebagai Radar Merah/Kuning
            const res: any = await api.get('/reports', {
                params: { is_valid: 'true' } // Filter yang belum ditutup
            });

            // Karena endpoint /reports adalah paginated, kita ambil array `data` nya
            const reports = res.data || [];

            // Filter di frontend untuk memastikan hanya status aktif yang tampil
            return reports.filter((r: any) =>
                !['SELESAI', 'BAIK', 'DITOLAK'].includes(r.status?.toUpperCase())
            );
        },
        enabled: isEnabled,
        // Socio-Engineering Trick: Auto-refresh setiap 30 detik untuk menarik laporan terbaru 
        // meskipun tidak ada event WebSocket (Fallback method)
        refetchInterval: 30000,
    });
};