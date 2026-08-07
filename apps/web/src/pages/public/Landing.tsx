// apps/web/src/pages/public/Landing.tsx
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { MapPin, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function Landing() {

    // Varian Animasi Framer Motion untuk efek muncul berurutan (Stagger)
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-white font-sans overflow-hidden">

            {/* ================= HERO SECTION ================= */}
            <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
                {/* Latar Belakang (Asumsi gambar ditaruh di apps/web/public/img/background_dishub_kbb.png) */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
                    <img
                        src="/img/background_dishub_kbb.png"
                        alt="Visual Dishub"
                        className="w-full h-full object-cover opacity-80"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-8 w-full">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="max-w-3xl"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                            </span>
                            Dishub Kabupaten Bandung Barat
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-4 leading-none">
                            LIN<span className="text-blue-600">TAS.</span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-700 font-bold tracking-tight uppercase mb-6 border-l-4 border-blue-600 pl-4">
                            Layanan Inventaris & Sistem Tata Aset
                        </motion.p>

                        <motion.p variants={itemVariants} className="text-base text-slate-500 leading-relaxed font-medium mb-10 max-w-xl">
                            Sistem pelaporan dan pendataan aset infrastruktur jalan yang cerdas dan terintegrasi untuk mewujudkan pelayanan publik yang prima di wilayah Kabupaten Bandung Barat.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                            <Link
                                to="/lapor"
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                            >
                                <MapPin size={16} /> Lapor Sekarang
                            </Link>
                            <Link
                                to="/track"
                                className="px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-sm flex items-center gap-2"
                            >
                                Lacak Tiket Anda
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ================= FITUR SECTION ================= */}
            <section className="relative z-30 py-20 px-6 md:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            { icon: <Zap size={32} />, title: 'Responsif', desc: 'Deteksi GPS otomatis memudahkan warga melapor kerusakan fasilitas tanpa perlu mengetik alamat panjang.', color: 'text-amber-500', bg: 'bg-amber-50' },
                            { icon: <ShieldCheck size={32} />, title: 'Terintegrasi', desc: 'Laporan warga langsung masuk ke ruang komando (Command Center) dan diverifikasi keasliannya (Anti-Hoax).', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { icon: <Activity size={32} />, title: 'Transparan', desc: 'Setiap aduan diberikan nomor tiket unik. Masyarakat dapat memantau progres perbaikan secara real-time.', color: 'text-emerald-500', bg: 'bg-emerald-50' }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-300">
                                <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 shadow-inner`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-3">{feature.title}</h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

        </div>
    );
}