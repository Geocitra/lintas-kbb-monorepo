// apps/web/src/components/layouts/RootLayout.tsx
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { socket } from '@/lib/socket';

export default function RootLayout() {

    useEffect(() => {
        // 1. Hidupkan mesin real-time saat aplikasi (React) dimuat ke browser
        socket.connect();

        // 2. Daftarkan "Telinga" (Listeners) untuk mendengarkan sinyal dari Backend
        socket.on('NEW_REPORT', (data: any) => {
            // Akan muncul pop-up ringan di pojok layar
            toast.error(`🚨 LAPORAN BARU MASUK!\nTiket: ${data.ticket_number}`);
        });

        socket.on('TICKET_ASSIGNED', (data: any) => {
            toast.success(`Tugas Baru Didelegasikan!\nCek Tiket: ${data.ticket_code}`);
        });

        socket.on('TICKET_EXECUTED', (_data: any) => {
            toast.success(`Teknisi telah melapor selesai!\nMenunggu Review Admin.`);
        });

        // 3. Clean-up: Matikan socket dan copot telinga saat komponen hancur/ditutup
        return () => {
            socket.off('NEW_REPORT');
            socket.off('TICKET_ASSIGNED');
            socket.off('TICKET_EXECUTED');
            socket.disconnect();
        };
    }, []);

    return (
        <>
            {/* Outlet adalah tempat di mana React Router akan merender halaman (Landing, Login, Dashboard, dll) */}
            <Outlet />

            {/* Wadah untuk notifikasi pop-up (Toast) agar muncul di atas semua elemen (z-index tinggi) */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 5000, // Hilang otomatis dalam 5 detik
                    style: {
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                    },
                }}
            />
        </>
    );
}