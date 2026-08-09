// apps/web/src/pages/public/Landing.tsx
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Zap, Activity, ArrowRight, ChevronRight } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen font-sans overflow-hidden">

            {/* ================= HERO SECTION ================= */}
            <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">

                {/* Background foto — full bleed, hanya satu overlay tipis */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `url('/bg-hero.png')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                    }}
                />
                {/* Overlay — sisi kiri lebih gelap untuk readability teks, kanan transparan */}
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20" />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 w-full py-20">
                    <div className="max-w-2xl">

                        {/* Badge */}
                        <div className="flex items-center gap-2 mb-8">
                            <img src="/Logo_Dishub.png" alt="Logo" className="w-8 h-8 object-contain" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                Dishub Kabupaten Bandung Barat
                            </span>
                        </div>

                        <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter mb-4 leading-none">
                            LIN<span className="text-blue-400">TAS</span><span className="text-blue-400">.</span>
                        </h1>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px w-12 bg-blue-500" />
                            <p className="text-xs font-black text-blue-400 uppercase tracking-[0.3em]">
                                Layanan Inventaris & Sistem Tata Aset
                            </p>
                        </div>

                        <p className="text-base text-slate-300 leading-relaxed font-medium mb-10 max-w-xl">
                            Sistem pelaporan dan pendataan aset infrastruktur jalan yang cerdas dan terintegrasi untuk Kabupaten Bandung Barat.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/lapor"
                                className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs tracking-widest uppercase transition-colors group"
                            >
                                <MapPin size={16} />
                                Lapor Kerusakan
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/track"
                                className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-xs tracking-widest uppercase transition-colors border border-white/20"
                            >
                                Lacak Tiket
                                <ChevronRight size={14} />
                            </Link>
                        </div>

                        {/* Stats bar */}
                        <div className="mt-16 flex gap-8">
                            {[
                                { label: 'Aset Terdaftar', val: '5.000+' },
                                { label: 'Laporan Ditangani', val: '1.200+' },
                                { label: 'Kecamatan', val: '16' },
                            ].map(s => (
                                <div key={s.label}>
                                    <p className="text-2xl font-black text-white">{s.val}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FITUR SECTION ================= */}
            <section className="bg-white py-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">

                    <div className="mb-14">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3">
                            Mengapa LINTAS?
                        </p>
                        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
                            Tiga Pilar Keunggulan
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap size={28} />,
                                title: 'Responsif',
                                desc: 'Deteksi GPS otomatis memudahkan warga melapor kerusakan fasilitas tanpa perlu mengetik alamat panjang.',
                                color: 'text-amber-500',
                                bg: 'bg-amber-50',
                            },
                            {
                                icon: <ShieldCheck size={28} />,
                                title: 'Terintegrasi',
                                desc: 'Laporan warga langsung masuk ke ruang komando Command Center dan diverifikasi keasliannya secara Anti-Hoax.',
                                color: 'text-blue-600',
                                bg: 'bg-blue-50',
                            },
                            {
                                icon: <Activity size={28} />,
                                title: 'Transparan',
                                desc: 'Setiap aduan diberikan nomor tiket unik. Masyarakat dapat memantau progres perbaikan secara real-time.',
                                color: 'text-emerald-600',
                                bg: 'bg-emerald-50',
                            }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="p-10 hover:bg-slate-50 transition-colors"
                            >
                                <div className={`w-14 h-14 ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">{feature.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= CTA SECTION ================= */}
            <section className="bg-slate-950 py-20 px-6 md:px-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">
                            Mulai Sekarang
                        </p>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                            Temukan Kerusakan Infrastruktur?
                        </h2>
                        <p className="text-slate-400 text-sm mt-2">
                            Laporkan dalam 60 detik. Kami akan menangani dalam 24 jam.
                        </p>
                    </div>
                    <Link
                        to="/lapor"
                        className="flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs tracking-widest uppercase transition-colors shrink-0 group"
                    >
                        <MapPin size={16} />
                        Lapor Sekarang
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>
        </div>
    );
}