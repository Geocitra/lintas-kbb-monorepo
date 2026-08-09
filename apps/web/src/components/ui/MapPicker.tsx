// apps/web/src/components/ui/MapPicker.tsx
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

// Memperbaiki masalah path ikon default Leaflet di React/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ikon kustom untuk posisi warga (Warna Merah/Orange)
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Ikon kustom untuk aset Dishub (Warna Biru)
const assetIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Tipe Data Aset yang dikembalikan API
interface NearbyAsset {
    id: string;
    id_asset: string;
    nama_aset: string;
    kategori_id: string;
    lat: number;
    lng: number;
    distance_meters: number;
}

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    onAssetSelect: (assetId: string | null) => void;
}

// Komponen Pengendali Peta Internal (Menangkap klik dan pergeseran peta)
function MapEvents({
    setPos,
    isLocked
}: {
    setPos: (pos: L.LatLng) => void;
    isLocked: boolean;
}) {
    useMapEvents({
        click(e) {
            if (!isLocked) setPos(e.latlng);
        },
    });
    return null;
}

// Komponen Pengendali FlyTo (Animasi Kamera)
function MapFlyTo({ center }: { center: L.LatLng }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 18, { animate: true });
    }, [center, map]);
    return null;
}

export default function MapPicker({ onLocationSelect, onAssetSelect }: MapPickerProps) {
    // Default Center: Kantor Pemda / KBB (-6.8431, 107.4912)
    const [position, setPosition] = useState<L.LatLng>(new L.LatLng(-6.8431, 107.4912));
    const [isLocked, setIsLocked] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const [nearbyAssets, setNearbyAssets] = useState<NearbyAsset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
    const [isLoadingAssets, setIsLoadingAssets] = useState(false);

    const markerRef = useRef<L.Marker>(null);
    const RADIUS_METERS = 20; // Sesuai kesepakatan Socio-Engineering (Radius presisi tinggi)

    // Trigger pencarian aset saat posisi terkunci
    useEffect(() => {
        if (isLocked) {
            onLocationSelect(position.lat, position.lng);
            fetchNearbyAssets(position.lat, position.lng);
        }
    }, [isLocked, position]);

    const fetchNearbyAssets = async (lat: number, lng: number) => {
        setIsLoadingAssets(true);
        setSelectedAsset(null);
        onAssetSelect(null);

        try {
            // NOTE: Nanti kita tambahkan rute ini di Backend Patch Phase!
            const response: any = await api.get('/spatial/nearest', {
                params: { lat, lng, radius: RADIUS_METERS }
            });

            setNearbyAssets(response.data || []);

            if (response.data?.length === 0) {
                toast.error(`Tidak ada aset Dishub dalam radius ${RADIUS_METERS} meter!`, { icon: '⚠️' });
            } else {
                toast.success(`Ditemukan ${response.data.length} aset di sekitar Anda!`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal mencari aset terdekat.');
        } finally {
            setIsLoadingAssets(false);
        }
    };

    const handleGetLocation = () => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            toast.error('Browser Anda tidak mendukung Geolocation.');
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
                setPosition(newPos);
                setIsLocating(false);
                setIsLocked(true); // Otomatis mengunci dan mencari aset
                toast.success('Lokasi GPS berhasil dikunci!');
            },
            (_err) => {
                setIsLocating(false);
                toast.error('Gagal mendapatkan GPS. Pastikan izin lokasi diaktifkan.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleAssetSelect = (assetId: string) => {
        setSelectedAsset(assetId);
        onAssetSelect(assetId);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    {isLocating ? (
                        <span className="animate-spin text-lg">⚙️</span>
                    ) : (
                        <Crosshair size={16} />
                    )}
                    {isLocating ? 'Mencari Satelit...' : 'Gunakan GPS Saat Ini'}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setIsLocked(!isLocked);
                        if (isLocked) {
                            // Reset state aset jika kunci dibuka kembali
                            setNearbyAssets([]);
                            setSelectedAsset(null);
                            onAssetSelect(null);
                        }
                    }}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${isLocked ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    {isLocked ? 'Buka Kunci' : 'Kunci Posisi Manual'}
                </button>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-[300px] md:h-[380px] overflow-hidden border border-slate-700 z-0">
                <MapContainer center={position} zoom={18} scrollWheelZoom={false} className="w-full h-full">
                    {/* Satellite tiles — Google Hybrid (jalan + label) */}
                    <TileLayer
                        attribution='&copy; Google Maps'
                        url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                    />

                    <MapEvents setPos={setPosition} isLocked={isLocked} />
                    <MapFlyTo center={position} />

                    {/* Marker Posisi User */}
                    <Marker
                        position={position}
                        icon={userIcon}
                        ref={markerRef}
                        draggable={!isLocked}
                        eventHandlers={{
                            dragend: () => {
                                const marker = markerRef.current;
                                if (marker) {
                                    setPosition(marker.getLatLng());
                                }
                            },
                        }}
                    />

                    {/* Lingkaran Radius Pencarian */}
                    {isLocked && (
                        <Circle
                            center={position}
                            pathOptions={{ fillColor: '#3b82f6', color: '#2563eb', weight: 2, fillOpacity: 0.2 }}
                            radius={RADIUS_METERS}
                        />
                    )}

                    {/* Marker Aset Terdekat (Hasil dari Backend) */}
                    {nearbyAssets.map(asset => (
                        <Marker
                            key={asset.id}
                            position={[asset.lat, asset.lng]}
                            icon={assetIcon}
                        />
                    ))}
                </MapContainer>

                {/* Overlay Bantuan */}
                {!isLocked && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase z-[1000] pointer-events-none flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Geser marker atau klik peta
                    </div>
                )}
            </div>

            {/* Selection Box (Tampil jika terkunci) */}
            {isLocked && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin size={16} className="text-blue-600" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
                            Pilih Aset Yang Rusak
                        </h3>
                    </div>

                    {isLoadingAssets ? (
                        <div className="py-8 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                            Memindai Aset Terdekat...
                        </div>
                    ) : nearbyAssets.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {nearbyAssets.map(asset => (
                                <button
                                    type="button"
                                    key={asset.id}
                                    onClick={() => handleAssetSelect(asset.id)}
                                    className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all ${selectedAsset === asset.id
                                        ? 'border-blue-600 bg-white shadow-lg shadow-blue-100'
                                        : 'border-white bg-white/50 hover:bg-white hover:border-blue-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-black text-slate-800">{asset.nama_aset}</span>
                                        {selectedAsset === asset.id && <CheckCircle2 size={18} className="text-blue-600" />}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                            ID: {asset.id_asset}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-500">
                                            Berjarak {Math.round(asset.distance_meters)} meter
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3">
                                <AlertTriangle size={24} />
                            </div>
                            <p className="text-xs font-bold text-slate-700">Tidak Ada Aset Ditemukan</p>
                            <p className="text-[10px] font-medium text-slate-500 mt-1 max-w-xs">
                                Sistem tidak mendeteksi fasilitas jalan milik Dishub dalam radius {RADIUS_METERS} meter dari posisi Anda. Silakan mendekat ke objek.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}