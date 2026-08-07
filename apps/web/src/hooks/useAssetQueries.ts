// apps/web/src/hooks/useAssetQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { BulkProcurementDTO } from '@dishub/types';

// ==========================================
// 1. QUERY: GET ALL ASSETS (SERVER-SIDE PAGINATION)
// ==========================================
export const useAssets = (
    page: number = 1,
    limit: number = 10,
    filters?: { search?: string; status?: string; kategori?: string }
) => {
    return useQuery({
        // QueryKey dinamis. Jika page atau filter berubah, TanStack akan otomatis fetch data baru
        queryKey: ['assets', page, limit, filters],
        queryFn: async () => {
            // Ingat: api.ts kita otomatis mengembalikan response.data
            const res: any = await api.get('/assets', {
                params: {
                    page,
                    limit,
                    ...filters
                }
            });
            return res; // Mengembalikan { success, message, data, meta }
        },
        // Simpan di cache agar navigasi mundur/maju (Next/Prev) instan
        staleTime: 60 * 1000, // 1 Menit
    });
};

// ==========================================
// 2. QUERY: GET SINGLE ASSET
// ==========================================
export const useAssetById = (id: string | null) => {
    return useQuery({
        queryKey: ['asset', id],
        queryFn: async () => {
            const res: any = await api.get(`/assets/${id}`);
            return res.data; // Langsung ekstrak objek asetnya
        },
        enabled: !!id, // Hanya tembak API jika ID tidak null
    });
};

// ==========================================
// 3. MUTATION: CREATE ASSET (SINGLE VIA MAP)
// ==========================================
export const useCreateAsset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            // Menggunakan form-data karena ada upload gambar (Multer)
            const res: any = await api.post('/assets', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res;
        },
        onSuccess: () => {
            // Perintahkan React untuk me-refresh tabel aset dan peta secara otomatis
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['gis_assets'] });
        }
    });
};

// ==========================================
// 4. MUTATION: BULK PROCUREMENT (PENGADAAN MASAL)
// ==========================================
export const useBulkCreateAsset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: BulkProcurementDTO) => {
            // Mengirim JSON murni karena pengadaan massal tidak butuh gambar fisik awal
            const res: any = await api.post('/assets/procurement/bulk', payload);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        }
    });
};

// ==========================================
// 5. MUTATION: UPDATE ASSET
// ==========================================
export const useUpdateAsset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            const res: any = await api.put(`/assets/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res;
        },
        onSuccess: (_, variables) => {
            // Segarkan daftar aset, titik spasial, dan detail aset spesifik
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['gis_assets'] });
            queryClient.invalidateQueries({ queryKey: ['asset', variables.id] });
        }
    });
};

// ==========================================
// 6. MUTATION: DELETE / AFKIR ASSET
// ==========================================
export const useDeleteAsset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res: any = await api.delete(`/assets/${id}`);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['gis_assets'] });
        }
    });
};