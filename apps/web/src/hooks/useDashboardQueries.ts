// apps/web/src/hooks/useDashboardQueries.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ==========================================
// 1. QUERY: MENGAMBIL STATISTIK DASHBOARD
// ==========================================
export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['dashboard_stats'],
        queryFn: async () => {
            const res: any = await api.get('/dashboard/stats');
            return res.data; // Mengembalikan object overview, charts, dan critical_assets
        },
        // Data dashboard di-cache selama 5 menit agar perpindahan halaman sangat cepat
        staleTime: 5 * 60 * 1000,
    });
};

// ==========================================
// 2. MUTATION: EXPORT ENGINE (BLOB DOWNLOADER)
// ==========================================
// Menggunakan useMutation agar kita bisa mendapatkan status isLoading untuk tombol di UI

export const useExportExcel = () => {
    return useMutation({
        mutationFn: async () => {
            // Wajib menggunakan responseType 'blob' agar file biner tidak rusak saat diterima Axios
            const response: any = await api.get('/dashboard/export/excel', {
                responseType: 'blob'
            });
            return response;
        },
        onSuccess: (data) => {
            // Trik manipulasi DOM untuk memaksa browser memunculkan dialog "Save As..."
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            // Nama file disesuaikan dengan format waktu
            link.setAttribute('download', `Export_Aset_Dishub_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();

            // Clean up memori browser
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    });
};

export const useExportPdf = () => {
    return useMutation({
        mutationFn: async () => {
            const response: any = await api.get('/dashboard/export/pdf', {
                responseType: 'blob'
            });
            return response;
        },
        onSuccess: (data) => {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Laporan_Aset_Dishub_${new Date().getTime()}.pdf`);
            document.body.appendChild(link);
            link.click();

            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    });
};