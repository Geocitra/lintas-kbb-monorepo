// apps/web/src/hooks/useAnnouncementQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CreateAnnouncementDTO } from '@dishub/types';

// ==========================================
// 1. QUERY: MENGAMBIL DAFTAR PENGUMUMAN (FEED)
// ==========================================
export const useAnnouncements = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ['announcements', page, limit],
        queryFn: async () => {
            const res: any = await api.get('/announcements', { params: { page, limit } });
            return res; // Format standar { success, data, meta }
        },
        staleTime: 60 * 1000, // 1 Menit
    });
};

// ==========================================
// 2. QUERY: RADAR PENGUMUMAN DARURAT (FORCED POP-UP)
// ==========================================
export const useUrgentAnnouncements = (isEnabled: boolean = true) => {
    return useQuery({
        queryKey: ['urgent_announcements'],
        queryFn: async () => {
            const res: any = await api.get('/announcements/urgent');
            return res.data; // Mengembalikan array pengumuman yang belum dibaca
        },
        enabled: isEnabled, // Aktif jika user sudah login
        // BACKGROUND POLLING: React akan menembak API ini secara diam-diam setiap 60 detik.
        // Jika Kadis menyebar pengumuman baru, dalam 1 menit layar teknisi langsung terkunci!
        refetchInterval: 60 * 1000,
        refetchOnWindowFocus: true, // Langsung cek jika user kembali ke tab web kita
    });
};

// ==========================================
// 3. MUTATION: READ RECEIPT ("SAYA MENGERTI")
// ==========================================
export const useAcknowledgeAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (announcementId: string) => {
            const res: any = await api.post(`/announcements/${announcementId}/ack`);
            return res;
        },
        onSuccess: () => {
            // Sinyal ke React untuk me-refresh data Urgent (Modal pop-up akan otomatis hilang)
            queryClient.invalidateQueries({ queryKey: ['urgent_announcements'] });
            // Sinyal untuk mengubah status badge (Belum Dibaca -> Sudah Dibaca) di tabel feed
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        }
    });
};

// ==========================================
// 4. MUTATION: MEMBUAT PENGUMUMAN BARU (KHUSUS KADIS/ADMIN)
// ==========================================
export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateAnnouncementDTO) => {
            const res: any = await api.post('/announcements', data);
            return res;
        },
        onSuccess: () => {
            // Refresh tabel daftar pengumuman milik admin
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        }
    });
};