// apps/web/src/features/gis/panels/DetailEntityPanel.tsx
import { Copy, ShieldAlert, Wrench, Eye, ExternalLink, MapPin, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Utility untuk format URL Gambar dari backend
const getImageUrl = (path?: string) => {
    if (!path) return 'https://placehold.co/600x400/f8fafc/94a3b8?text=NO+IMAGE';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.PROD ? window.location.origin : 'http://localhost:3000'}${path}`;
};

// ==========================================
// 1. KOMPONEN: DETAIL ASET
// ==========================================
export function DetailAssetPanel({ data }: { data: any }) {
    if (!data) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(`${data.lat}, ${data.lng}`);
        toast.success('Koordinat disalin!');
    };

    const isKritis = data.kondisi?.includes('KRITIS') || data.kondisi?.includes('RUSAK');

    return (
        <div className="flex flex-col h-full bg-white text-slate-800 font-sans text-left pb-6">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">

                {/* Foto & Status */}
                <div className="relative w-full h-40 bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200 shrink-0">
                    <img src={getImageUrl(data.foto_utama)} alt={data.nama_aset} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white rounded-lg shadow-md ${data.kondisi?.includes('BAIK') ? 'bg-emerald-600' : 'bg-rose-600 animate-pulse'}`}>
                            {data.kondisi?.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* Warning Alert */}
                {isKritis && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                        <ShieldAlert className="text-rose-600 shrink-0 mt-0.5 animate-pulse" size={16} />
                        <div className="space-y-1.5">
                            <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-widest leading-none">Butuh Atensi</h4>
                            <p className="text-[10px] font-medium text-rose-700 leading-relaxed">
                                Aset ini mengalami kerusakan. Segera buat Surat Perintah Kerja (SLA).
                            </p>
                            <Link to={`/admin/tickets/create?asset_id=${data.id}`} className="inline-flex items-center gap-1.5 mt-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-[9px] tracking-widest uppercase px-3 py-2 rounded-lg transition-colors shadow-sm">
                                <Wrench size={12} /> Buat Tiket SLA
                            </Link>
                        </div>
                    </div>
                )}

                {/* Spesifikasi Tabel */}
                <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Spesifikasi</span>
                    <div className="border border-slate-200 bg-white rounded-xl divide-y divide-slate-100 text-xs font-medium">
                        <div className="p-3 flex justify-between">
                            <span className="text-slate-400 font-bold">Kategori</span>
                            <span className="text-slate-800 text-right">{data.kategori_nama || data.kategori?.nama || '-'}</span>
                        </div>
                        <div className="p-3 flex justify-between">
                            <span className="text-slate-400 font-bold">Jenis</span>
                            <span className="text-slate-800 text-right">{data.jenis || '-'}</span>
                        </div>
                        <div className="p-3 flex justify-between items-start">
                            <span className="text-slate-400 font-bold shrink-0 mr-4">Lokasi</span>
                            <span className="text-slate-800 text-right leading-relaxed">{data.alamat_fisik || 'Alamat tidak terdata'}</span>
                        </div>
                    </div>
                </div>

                {/* GPS Info */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">GPS Satelit</span>
                        <span className="text-[11px] font-mono font-black text-blue-700 mt-1">{data.lat.toFixed(5)}, {data.lng.toFixed(5)}</span>
                    </div>
                    <button onClick={handleCopy} className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 rounded-lg shadow-sm">
                        <Copy size={14} />
                    </button>
                </div>

            </div>
        </div>
    );
}

// ==========================================
// 2. KOMPONEN: DETAIL LAPORAN / TIKET
// ==========================================
export function DetailReportPanel({ data }: { data: any }) {
    if (!data) return null;

    return (
        <div className="flex flex-col h-full bg-white text-slate-800 font-sans text-left pb-6">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">

                {/* Foto Kejadian */}
                <div className="relative w-full h-48 bg-slate-900 rounded-2xl overflow-hidden shadow-inner shrink-0">
                    <img src={getImageUrl(data.foto_kejadian)} alt="Kejadian" className="w-full h-full object-cover opacity-90" />
                    <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-slate-900 rounded-md text-[9px] font-black uppercase tracking-widest shadow-lg">
                            {data.sumber_pelapor}
                        </span>
                    </div>
                </div>

                {/* Info Laporan */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-rose-500" />
                        <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Kasus Aktif</h4>
                    </div>
                    <p className="text-sm font-bold text-slate-800 leading-snug">{data.judul_laporan}</p>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-slate-600 italic leading-relaxed">
                        "{data.deskripsi || data.deskripsi_keluhan || 'Tanpa Keterangan'}"
                    </div>
                </div>

                {/* Aset Terkait (Jika ada) */}
                {data.asset_id && (
                    <div className="border-t border-slate-100 pt-5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Terhubung ke Aset</span>
                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><MapPin size={14} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-900 uppercase">ID: {data.asset?.id_asset || data.asset_id}</p>
                                    <p className="text-[9px] font-bold text-blue-600 mt-0.5">{data.asset?.nama_aset || 'Aset Terdeteksi'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Action Bawah */}
            <div className="p-5 border-t border-slate-100 bg-white shrink-0">
                <Link
                    to={`/admin/reports/${data.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                    <Eye size={14} /> Buka Halaman Verifikasi <ExternalLink size={14} />
                </Link>
            </div>
        </div>
    );
}