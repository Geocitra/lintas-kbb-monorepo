// apps/web/src/hooks/useGeolocation.ts
import { useState, useCallback } from 'react';

interface Coordinates {
    lat: number;
    lng: number;
}

export function useGeolocation() {
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getLocation = useCallback(() => {
        setIsLoading(true);
        setError(null);

        // 1. Cek Kompatibilitas Browser
        if (!navigator.geolocation) {
            setError('Perangkat atau Browser Anda tidak mendukung fitur GPS/Geolokasi.');
            setIsLoading(false);
            return;
        }

        // 2. Minta Koordinat dengan tingkat akurasi tinggi (Penting untuk GIS)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordinates({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setIsLoading(false);
            },
            (err) => {
                // 3. Translasi Kode Error menjadi Pesan Manusiawi (Socio-Engineering UX)
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError('Izin akses lokasi ditolak. Silakan izinkan akses lokasi (GPS) di pengaturan browser Anda.');
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError('Informasi lokasi tidak tersedia saat ini. Pastikan GPS menyala.');
                        break;
                    case err.TIMEOUT:
                        setError('Waktu permintaan akses lokasi habis (Timeout). Sinyal satelit mungkin lemah.');
                        break;
                    default:
                        setError('Terjadi kesalahan yang tidak diketahui saat mengunci lokasi.');
                        break;
                }
                setIsLoading(false);
            },
            {
                enableHighAccuracy: true, // Memaksa browser menggunakan chip GPS (bukan estimasi IP/Wifi)
                timeout: 15000,           // Batas tunggu 15 detik
                maximumAge: 0,            // Jangan gunakan cache lokasi lama
            }
        );
    }, []);

    return { coordinates, error, isLoading, getLocation };
}