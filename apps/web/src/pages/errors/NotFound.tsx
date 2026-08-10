// apps/web/src/pages/errors/NotFound.tsx
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-28 h-28 bg-rose-100 rounded-full flex items-center justify-center mb-8 shadow-inner border-[8px] border-white">
                <ShieldAlert size={56} className="text-rose-600" />
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-4 leading-none">
                404
            </h1>

            <h2 className="text-lg font-black text-rose-600 uppercase tracking-[0.3em] mb-4">
                Destinasi Tidak Valid
            </h2>

            <p className="text-slate-500 font-medium max-w-md mb-10 leading-relaxed text-sm">
                Jalur yang Anda tuju tidak tersedia di dalam radar sistem LINTAS. Pastikan URL sudah benar atau hubungi Administrator.
            </p>

            <Link
                to="/"
                className="px-8 py-4 bg-slate-900 text-white hover:bg-blue-600 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl hover:-translate-y-1"
            >
                Kembali ke Beranda
            </Link>
        </div>
    );
}