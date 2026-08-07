// apps/web/src/hooks/useAuditQueries.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ==========================================
// QUERY: GET AUDIT TRAIL (HISTORY)
// ==========================================
export const useAuditTrail = (
    page: number = 1,
    limit: number = 10,
    assetId?: string // Opsional: Jika ingin melihat riwayat 1 aset secara spesifik
) => {
    return useQuery({
        queryKey: ['audit_trail', page, limit, assetId],
        queryFn: async () => {
            // Memanggil endpoint dari modul Audit yang kita buat di Fase 5 Backend
            const res: any = await api.get('/audit/histories', {
                params: {
                    page,
                    limit,
                    asset_id: assetId
                }
            });
            return res; // Mengembalikan { success, message, data, meta }
        },
        // Karena audit logs sangat konstan dan untuk investigasi, kita cache sebentar saja
        staleTime: 30 * 1000,
    });
};