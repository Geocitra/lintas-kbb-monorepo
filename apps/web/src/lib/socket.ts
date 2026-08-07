// apps/web/src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

// Secara default, Vite berjalan di 5173 dan Express di 3000.
// Kita arahkan socket langsung ke port 3000 di mode development.
const SOCKET_URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:3000';

export const socket: Socket = io(SOCKET_URL, {
    // BEST PRACTICE: Jangan konek otomatis saat file diload. 
    // Kita akan panggil socket.connect() secara manual nanti saat aplikasi (App.tsx) sudah selesai di-render.
    autoConnect: false,

    // Jika server backend mati, coba hubungkan ulang maksimal 5 kali dengan jeda 2 detik
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,

    transports: ['websocket', 'polling']
});

// Listener Global untuk debugging (Bisa dihapus saat production)
socket.on('connect', () => {
    console.log('🟢 [WebSocket Klien] Terhubung ke Server dengan ID:', socket.id);
});

socket.on('disconnect', () => {
    console.log('🔴 [WebSocket Klien] Terputus dari Server.');
});