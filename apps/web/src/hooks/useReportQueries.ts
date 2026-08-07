// apps/web/src/hooks/useReportQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ==========================================
// 1. QUERY: MENGAMBIL DAFTAR LAPORAN (SERVER-SIDE PAGINATION)
// ==========================================
export const useReports = (
    page: number = 1,
    limit: number = 10,
    isValid?: boolean // Filter opsional: tampilkan yang valid saja atau yang SPAM saja
) => {
    return useQuery({
        queryKey: ['reports', page, limit, isValid],
        queryFn: async () => {
            const res: any = await api.get('/reports', {
                params: {
                    page,
                    limit,
                    is_valid: isValid !== undefined ? isValid : undefined
                }
            });
            return res; // Me-return format standar { success, data, meta }
        },
        // Data laporan dianggap segar selama 30 detik (Cegah spam request saat buka tutup halaman)
        staleTime: 30 * 1000,
    });
};

// ==========================================
// 2. MUTATION: MENGUBAH STATUS LAPORAN MANUAL (JIKA DIPERLUKAN)
// ==========================================
// (Catatan: Sebagian besar laporan akan ditutup secara otomatis saat 
// tiket perbaikan selesai. Namun jika Admin menolak/membatalkan laporan, gunakan ini)
export const useUpdateReportStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status, catatan_admin }: { id: string; status: string; catatan_admin: string }) => {
            const res: any = await api.patch(`/reports/${id}/status`, { status, catatan_admin });
            return res;
        },
        onSuccess: () => {
            // Refresh tabel laporan dan tabel tiket secara instan
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['gis_active_reports'] }); // Update radar peta
        }
    });
};