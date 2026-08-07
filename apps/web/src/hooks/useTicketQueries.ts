// apps/web/src/hooks/useTicketQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AssignTicketDTO, ReviewTicketDTO } from '@dishub/types';

// ==========================================
// 1. QUERY: MONITORING SELURUH TIKET (KHUSUS ADMIN/KADIS)
// ==========================================
export const useAllTickets = (page: number = 1, limit: number = 10, status?: string) => {
    return useQuery({
        queryKey: ['tickets', page, limit, status],
        queryFn: async () => {
            const res: any = await api.get('/tickets', { params: { page, limit, status } });
            return res;
        },
        staleTime: 30 * 1000,
    });
};

// ==========================================
// 2. QUERY: DAFTAR TUGAS SAYA (KHUSUS TEKNISI LAPANGAN)
// ==========================================
export const useMyTasks = () => {
    return useQuery({
        queryKey: ['my_tasks'],
        queryFn: async () => {
            const res: any = await api.get('/tickets/my-tasks');
            return res.data; // Langsung ekstrak array tugasnya
        },
        // Karena ini halaman mobile lapangan yang penting, kita persingkat waktu cache (10 detik)
        staleTime: 10 * 1000,
    });
};

// ==========================================
// 3. MUTATION: PENUGASAN (TRIAGE ADMIN)
// ==========================================
export const useAssignTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reportId, data }: { reportId: string; data: AssignTicketDTO }) => {
            const res: any = await api.post(`/tickets/${reportId}/assign`, data);
            return res;
        },
        onSuccess: () => {
            // Menyegarkan semua antarmuka yang terkait
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        }
    });
};

// ==========================================
// 4. MUTATION: EKSEKUSI TUGAS OLEH TEKNISI (VIA KAMERA HP)
// ==========================================
export const useExecuteTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ ticketId, formData }: { ticketId: string; formData: FormData }) => {
            // MENGGUNAKAN FORM DATA: Karena Teknisi MENGUNGGAH BUKTI FOTO (Bisa ada EXIF)
            const res: any = await api.post(`/tickets/${ticketId}/execute`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res;
        },
        onSuccess: () => {
            // Refresh daftar tugas si Teknisi dan layar monitoring Admin
            queryClient.invalidateQueries({ queryKey: ['my_tasks'] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        }
    });
};

// ==========================================
// 5. MUTATION: QUALITY CONTROL (REVIEW OLEH ADMIN)
// ==========================================
export const useReviewTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ ticketId, data }: { ticketId: string; data: ReviewTicketDTO }) => {
            const res: any = await api.post(`/tickets/${ticketId}/review`, data);
            return res;
        },
        onSuccess: () => {
            // Ini adalah eksekusi pamungkas (Case Closed). Kita harus me-refresh hampir seluruh elemen sistem!
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['gis_assets'] }); // Refresh warna aset di peta jadi Hijau kembali
            queryClient.invalidateQueries({ queryKey: ['gis_active_reports'] }); // Hilangkan radar merah di peta
        }
    });
};