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
const createAssetIcon = (status: string, iconMarker: string) => {
    let color = '#16a34a'; // Default Baik (Hijau)
    const s = status?.toUpperCase() || '';

    if (s.includes('RUSAK')) color = '#fbbf24'; // Kuning
    if (s.includes('KRITIS') || s.includes('HILANG')) color = '#dc2626'; // Merah
    if (s.includes('PERBAIKAN') || s.includes('PROSES')) color = '#3b82f6'; // Biru

    return L.divIcon({
        className: 'bg-transparent border-none',
        html: `
      <div class="relative flex flex-col items-center" style="transform: translate(-50%, -100%);">
        <div class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110" style="background-color: ${color};">
          <span class="text-sm select-none drop-shadow-md">${iconMarker || '📍'}</span>
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
                    // Fallback Emoji jika database kosong
                    const iconMarker = asset.metadata?.icon_marker || '📍';

                    return (
                        <Marker
                            key={`asset-${asset.id}`}
                            position={[asset.lat, asset.lng]}
                            icon={createAssetIcon(asset.kondisi, iconMarker)}
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