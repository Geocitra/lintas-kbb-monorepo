// apps/web/src/components/layouts/RootLayout.tsx
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { socket } from '@/lib/socket';

export default function RootLayout() {

    useEffect(() => {
        // Handler bernama agar .off() hanya mencabut listener kita,
        // bukan semua listener global yang sudah terdaftar di socket.ts
        const onNewReport = (data: any) => {
            toast.error(`🚨 LAPORAN BARU MASUK!\nTiket: ${data.ticket_number}`);
        };
        const onTicketAssigned = (data: any) => {
            toast.success(`Tugas Baru Didelegasikan!\nCek Tiket: ${data.ticket_code}`);
        };
        const onTicketExecuted = (_data: any) => {
            toast.success(`Teknisi telah melapor selesai!\nMenunggu Review Admin.`);
        };

        // Guard: hanya connect jika belum terhubung (mencegah double-connect di React StrictMode)
        if (!socket.connected) {
            socket.connect();
        }

        socket.on('NEW_REPORT', onNewReport);
        socket.on('TICKET_ASSIGNED', onTicketAssigned);
        socket.on('TICKET_EXECUTED', onTicketExecuted);

        // Cleanup: hanya copot listener kita — JANGAN disconnect socket singleton
        // agar React StrictMode double-invoke tidak merusak koneksi
        return () => {
            socket.off('NEW_REPORT', onNewReport);
            socket.off('TICKET_ASSIGNED', onTicketAssigned);
            socket.off('TICKET_EXECUTED', onTicketExecuted);
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