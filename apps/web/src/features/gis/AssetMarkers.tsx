// apps/web/src/features/gis/AssetMarkers.tsx
import React, { useMemo } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';

import { useGisUIStore } from '@/store/useGisUIStore';
import { useViewportAssets } from '@/hooks/useGisQueries';

// ==========================================
// KREATOR IKON KUSTOM (Tailwind CSS to HTML)
// ==========================================
const getCategorySvg = (kategoriNama?: string) => {
    const name = kategoriNama?.toUpperCase() || '';
    
    // 1. PJU (Penerangan Jalan Umum) -> Lightbulb Icon
    if (name.includes('PJU') || name.includes('PENERANGAN')) {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                <path d="M9 18h6"/>
                <path d="M10 22h4"/>
            </svg>
        `;
    }
    
    // 2. APILL (Traffic Light) -> Traffic Light Icon
    if (name.includes('APILL') || name.includes('TRAFFIC') || name.includes('ISYARAT')) {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect width="8" height="18" x="8" y="3" rx="2"/>
                <circle cx="12" cy="7" r="2"/>
                <circle cx="12" cy="12" r="2"/>
                <circle cx="12" cy="17" r="2"/>
            </svg>
        `;
    }
    
    // 3. RAMBU -> Signpost Icon
    if (name.includes('RAMBU') || name.includes('CERMIN') || name.includes('MARKAN')) {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v20"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
        `;
    }
    
    // 4. Fallback -> MapPin Icon
    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z"/>
            <circle cx="12" cy="10" r="3"/>
        </svg>
    `;
};

const createAssetIcon = (status: string, kategoriNama: string) => {
    let color = '#16a34a'; // Default Baik (Hijau)
    const s = status?.toUpperCase() || '';

    if (s.includes('RUSAK')) color = '#fbbf24'; // Kuning
    if (s.includes('KRITIS') || s.includes('HILANG')) color = '#dc2626'; // Merah
    if (s.includes('PERBAIKAN') || s.includes('PROSES')) color = '#3b82f6'; // Biru

    const svgIcon = getCategorySvg(kategoriNama);

    return L.divIcon({
        className: 'bg-transparent border-none',
        html: `
      <div class="relative flex flex-col items-center" style="transform: translate(-50%, -100%);">
        <div class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110" style="background-color: ${color};">
          ${svgIcon}
        </div>
        <div class="w-0 h-0 border-l-[6px] border-r-[6px] border-t-8 border-l-transparent border-r-transparent" style="border-t-color: ${color}; margin-top: -1px;"></div>
      </div>
    `,
        iconSize: [32, 40],
        iconAnchor: [0, 0]
    });
};

// Kreator Ikon untuk Klaster
const createClusterIcon = (cluster: any) => {
    const count = cluster.getChildCount();
    return createClusterIconFromCount(count);
};

const createClusterIconFromCount = (count: number) => {
    let sizeClass = 'w-9 h-9 text-xs';
    let iconSize: [number, number] = [36, 36];

    if (count >= 10 && count < 50) {
        sizeClass = 'w-11 h-11 text-sm';
        iconSize = [44, 44];
    } else if (count >= 50) {
        sizeClass = 'w-14 h-14 text-base';
        iconSize = [56, 56];
    }

    return L.divIcon({
        className: 'bg-transparent border-none',
        html: `
      <div class="${sizeClass} bg-slate-900/95 text-blue-400 flex items-center justify-center rounded-full border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] font-mono font-black select-none transition-transform hover:scale-110">
        ${count}
      </div>
    `,
        iconSize: iconSize,
        iconAnchor: [iconSize[0] / 2, iconSize[1] / 2]
    });
};

export default function AssetMarkers() {
    const map = useMap();

    // 1. Tarik State UI (Batas Layar)
    const mapBounds = useGisUIStore((state) => state.mapBounds);
    const mapZoom = useGisUIStore((state) => state.mapZoom);
    const activeLayers = useGisUIStore((state) => state.activeLayers);
    const { openPanel, setSelectedAssetId } = useGisUIStore();

    // 2. Tarik Data API Cerdas (TanStack Query)
    const isLayerActive = activeLayers.includes('assets');
    const { data: assets = [] } = useViewportAssets(mapBounds, mapZoom, isLayerActive);

    // 3. Pisahkan antara Titik Asli dan Titik Klaster dari Server
    const { rawPoints, serverClusters } = useMemo(() => {
        const points: any[] = [];
        const clusters: any[] = [];

        assets.forEach((item: any) => {
            // Pastikan titik tidak gaib
            if (!item.lat || !item.lng) return;

            if (item.is_cluster) {
                clusters.push(item);
            } else {
                points.push(item);
            }
        });

        return { rawPoints: points, serverClusters: clusters };
    }, [assets]);

    // Handler saat titik diklik
    const handleMarkerClick = (asset: any) => {
        if (asset.is_cluster) {
            // Jika klaster server diklik, zoom in 2 tingkat
            map.flyTo([asset.lat, asset.lng], mapZoom + 2, { animate: true });
        } else {
            // Jika aset asli diklik, fokuskan kamera dan buka Panel Detail Aset
            map.flyTo([asset.lat, asset.lng], 18, { animate: true });
            setSelectedAssetId(asset.id);
            openPanel('detil-aset', `ID: ${asset.kode_inventaris || asset.id_asset || 'N/A'}`, asset);
        }
    };

    if (!isLayerActive) return null;

    return (
        <React.Fragment>
            {/* RENDER KLASTER DARI SERVER (Level Zoom Rendah) */}
            {serverClusters.map((cluster) => (
                <Marker
                    key={cluster.id}
                    position={[cluster.lat, cluster.lng]}
                    icon={createClusterIconFromCount(cluster.cluster_count)}
                    eventHandlers={{ click: () => handleMarkerClick(cluster) }}
                >
                    <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
                        <div className="font-sans text-xs text-slate-800 p-1 font-bold">
                            Terdapat {cluster.cluster_count} Aset di wilayah ini
                        </div>
                    </Tooltip>
                </Marker>
            ))}

            {/* RENDER TITIK ASLI DENGAN KLASTER LOKAL (Level Zoom Tinggi) */}
            <MarkerClusterGroup
                chunkedLoading
                iconCreateFunction={createClusterIcon}
                showCoverageOnHover={false}
                maxClusterRadius={50}
                spiderfyOnMaxZoom={true}
            >
                {rawPoints.map((asset) => {
                    return (
                        <Marker
                            key={`asset-${asset.id}`}
                            position={[asset.lat, asset.lng]}
                            icon={createAssetIcon(asset.kondisi, asset.kategori_nama)}
                            eventHandlers={{ click: () => handleMarkerClick(asset) }}
                        >
                            <Tooltip direction="top" offset={[0, -32]} opacity={0.95}>
                                <div className="font-sans text-xs text-slate-800 p-1.5 space-y-1 text-left min-w-[140px]">
                                    <p className="font-black text-[9px] uppercase tracking-widest text-slate-400 leading-none">
                                        {asset.kategori_nama || asset.kategori?.nama || 'Aset'}
                                    </p>
                                    <h4 className="font-bold text-slate-900 leading-tight">
                                        {asset.nama_aset || asset.nama}
                                    </h4>
                                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 mt-1">
                                        <span className="w-2 h-2 rounded-full" style={{
                                            backgroundColor: asset.kondisi?.includes('BAIK') ? '#16a34a' : asset.kondisi?.includes('RUSAK') ? '#fbbf24' : '#dc2626'
                                        }}></span>
                                        <span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">
                                            {asset.kondisi?.replace('_', ' ') || 'UNKNOWN'}
                                        </span>
                                    </div>
                                </div>
                            </Tooltip>
                        </Marker>
                    );
                })}
            </MarkerClusterGroup>
        </React.Fragment>
    );
}