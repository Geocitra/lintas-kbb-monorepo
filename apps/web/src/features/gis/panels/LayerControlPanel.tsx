// apps/web/src/features/gis/panels/LayerControlPanel.tsx
import { Layers, Sliders, Moon, Sun, Map as MapIcon, Check } from 'lucide-react';
import { useGisUIStore } from '@/store/useGisUIStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function LayerControlPanel() {
    const { user } = useAuthStore();
    const {
        activeBaseMap, setActiveBaseMap,
        mapOpacity, setMapOpacity,
        activeLayers, toggleLayer
    } = useGisUIStore();

    const baseMaps = [
        { id: 'dark', label: 'Carto Dark', icon: Moon, desc: 'Kontras visual emisi tinggi' },
        { id: 'satellite', label: 'Satelit', icon: Sun, desc: 'Citra foto udara asli' },
        { id: 'light', label: 'OSM Standard', icon: MapIcon, desc: 'Peta jalan administratif' }
    ];

    const featureLayers = [
        { id: 'assets', label: 'Aset Dishub KBB', desc: 'PJU, Rambu, & Fasilitas' },
        ...((user?.role && ['ADMIN', 'KADIS', 'KASI'].includes(user.role)) ? [
            { id: 'reports', label: 'Radar Pengaduan', desc: 'Laporan warga & petugas' }
        ] : []),
        { id: 'boundaries', label: 'Batas Administrasi', desc: 'Batas wilayah Desa KBB' }
    ];

    return (
        <div className="flex flex-col h-full bg-white pb-6 font-sans text-left">

            {/* 1. KENDALI BASE MAP */}
            <div className="flex flex-col border-b border-slate-100">
                <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
                    <MapIcon size={14} className="text-blue-600" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Peta Dasar</h4>
                </div>
                <div className="flex flex-col">
                    {baseMaps.map((map) => {
                        const isActive = activeBaseMap === map.id;
                        return (
                            <button
                                key={map.id}
                                onClick={() => setActiveBaseMap(map.id)}
                                className={`flex items-center justify-between px-5 py-4 border-b border-slate-50 transition-colors w-full text-left outline-none ${isActive ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <map.icon size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-xs ${isActive ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                            {map.label}
                                        </span>
                                        <span className="text-[9px] font-medium text-slate-400 mt-1">{map.desc}</span>
                                    </div>
                                </div>
                                {isActive && <Check size={16} className="text-blue-600 stroke-[3px]" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. KENDALI LAPISAN SPASIAL (TOGGLE) */}
            <div className="flex flex-col border-b border-slate-100">
                <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
                    <Layers size={14} className="text-blue-600" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lapisan Data</h4>
                </div>
                <div className="flex flex-col p-2">
                    {featureLayers.map((layer) => {
                        const isActive = activeLayers.includes(layer.id);
                        return (
                            <button
                                key={layer.id}
                                onClick={() => toggleLayer(layer.id)}
                                className="flex items-center justify-between px-3 py-3 hover:bg-slate-50 rounded-xl transition-colors w-full text-left outline-none"
                            >
                                <div className="flex flex-col">
                                    <span className={`text-xs ${isActive ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                                        {layer.label}
                                    </span>
                                    <span className="text-[9px] font-medium text-slate-400 mt-1">{layer.desc}</span>
                                </div>
                                {/* Switch Toggle UI */}
                                <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out ${isActive ? 'bg-blue-500' : 'bg-slate-200'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-300 ease-in-out ${isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. KENDALI TRANSPARANSI (OPACITY) POLIGON */}
            <div className="flex flex-col bg-white">
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <Sliders size={14} className="text-blue-600" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transparansi Batas</h4>
                    </div>
                    <span className="text-[9px] font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                        {mapOpacity}%
                    </span>
                </div>
                <div className="px-6 py-6 space-y-3">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={mapOpacity}
                        onChange={(e) => setMapOpacity(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 outline-none"
                    />
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
                        <span>Transparan</span>
                        <span>Solid</span>
                    </div>
                </div>
            </div>
        </div>
    );
}