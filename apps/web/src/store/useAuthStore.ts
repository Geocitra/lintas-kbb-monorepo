// apps/web/src/store/useAuthStore.ts
import { create } from 'zustand';
import { api } from '@/lib/api';
import type { UserLoginDTO, Role } from '@dishub/types';

// Definisi bentuk profil pengguna sesuai respons Backend API
export interface UserProfile {
    id: string;
    name: string;
    nip: string | null;
    email: string;
    no_wa: string | null;
    role: Role;
    is_active: boolean;
    seksi?: {
        id: string;
        nama_seksi: string;
    } | null;
}

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isHydrating: boolean; // Status loading saat pertama kali web dibuka (mengecek token)

    // Actions
    login: (credentials: UserLoginDTO) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isHydrating: true, // Default true agar web memunculkan "Loading Screen" sementara mengecek sesi

    login: async (credentials: UserLoginDTO) => {
        try {
            // Memanggil endpoint login. (Zod error akan otomatis dilempar ke catch)
            const response: any = await api.post('/auth/login', credentials);
            const { token, user } = response.data;

            // 1. Simpan Token JWT ke LocalStorage
            localStorage.setItem('auth_token', token);

            // 2. Simpan Data User ke Memori Zustand
            set({ user, isAuthenticated: true });
        } catch (error) {
            throw error; // Lempar ke komponen React Hook Form agar ditampilkan sebagai pesan merah
        }
    },

    logout: () => {
        // Keamanan: Hancurkan token dari browser
        localStorage.removeItem('auth_token');

        // Reset state ke kondisi awal
        set({ user: null, isAuthenticated: false });

        // (Opsional) Disconnect WebSocket jika diperlukan
        // socket.disconnect();
    },

    checkAuth: async () => {
        // Fungsi ini dipanggil SATU KALI saat App.tsx di-mount (Halaman di-refresh)
        const token = localStorage.getItem('auth_token');

        if (!token) {
            // Tidak ada token = Guest (Tamu)
            set({ user: null, isAuthenticated: false, isHydrating: false });
            return;
        }

        try {
            // Validasi token ke server untuk mengambil profil terbaru (Hydration)
            const response: any = await api.get('/auth/me');

            set({
                user: response.data,
                isAuthenticated: true,
                isHydrating: false
            });
        } catch (error) {
            console.warn('Sesi tidak valid atau telah kedaluwarsa.');

            // Jika token usang (401), hancurkan agar tidak nyangkut
            localStorage.removeItem('auth_token');
            set({ user: null, isAuthenticated: false, isHydrating: false });
        }
    }
}));