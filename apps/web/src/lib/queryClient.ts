// apps/web/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data dianggap "segar" selama 5 menit. 
            // Selama 5 menit, React tidak akan menembak API Backend lagi untuk data yang sama.
            staleTime: 5 * 60 * 1000,

            // SOCIO-ENGINEERING GUARD:
            // Matikan refetch saat user pindah-pindah tab browser.
            // Jika nyala, server akan di-DDoS oleh request otomatis saat user alt-tab.
            refetchOnWindowFocus: false,

            // Jika API gagal (misal server restart), hanya coba ulang 1 kali sebelum melempar error ke UI
            retry: 1,

            // Jangan suspense otomatis untuk error, biarkan komponen yang menangani
            throwOnError: false,
        },
        mutations: {
            retry: 0, // Operasi POST/PUT/DELETE tidak boleh diulang otomatis jika gagal
        }
    },
});