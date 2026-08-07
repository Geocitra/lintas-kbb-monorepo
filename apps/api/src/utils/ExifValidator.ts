// apps/api/src/utils/ExifValidator.ts
import exifr from 'exifr';
import { AppError } from '../middlewares/errorHandler';

// Helper: Formula Haversine untuk menghitung jarak antara dua titik koordinat bumi
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Jarak dalam meter
}

export class ExifValidator {

    /**
     * Memvalidasi foto hasil kerja Teknisi
     * @param imageBuffer Buffer file gambar dari Multer
     * @param assignedAt Waktu kapan tiket ditugaskan (SLA Start)
     * @param assetLat Kordinat asli Aset
     * @param assetLng Kordinat asli Aset
     * @param toleranceMeters Toleransi jarak teknisi dengan aset
     */
    static async validateJobPhoto(
        imageBuffer: Buffer,
        assignedAt: Date,
        assetLat: number,
        assetLng: number,
        toleranceMeters: number = 50
    ) {
        try {
            // 1. Parse Data EXIF + GPS dari Buffer Foto
            const exifData = await exifr.parse(imageBuffer, { gps: true, exif: true });

            // Skenario A: EXIF Dihapus (Misal foto dikirim via WA lalu di-upload ulang)
            if (!exifData) {
                return {
                    valid: false,
                    status: 'EXIF_STRIPPED',
                    message: 'Peringatan: Metadata foto tidak ditemukan. Foto mungkin hasil tangkapan layar atau unduhan dari WhatsApp.'
                };
            }

            // 2. Validasi Waktu Pengambilan Gambar (Anti-Fraud: Foto Lama)
            const photoDate = exifData.DateTimeOriginal || exifData.CreateDate;
            if (photoDate) {
                if (new Date(photoDate) < assignedAt) {
                    // Socio-Engineering Guard!
                    throw new AppError(`Socio-Engineering Guard: Foto ini terdeteksi diambil pada ${new Date(photoDate).toLocaleString('id-ID')}, yaitu SEBELUM waktu penugasan tiket. Harap ambil foto secara real-time!`, 403);
                }
            } else {
                return { valid: false, status: 'DATE_STRIPPED', message: 'Waktu pengambilan foto tidak terlacak.' };
            }

            // 3. Validasi Lokasi Pengambilan Gambar (Geo-Tagging)
            const { latitude, longitude } = exifData;
            if (latitude !== undefined && longitude !== undefined) {
                const distance = calculateDistanceMeters(assetLat, assetLng, latitude, longitude);

                if (distance > toleranceMeters) {
                    // Socio-Engineering Guard!
                    throw new AppError(`Socio-Engineering Guard: Lokasi foto terlalu jauh dari titik Aset (${Math.round(distance)} meter). Toleransi maksimal adalah ${toleranceMeters} meter. Anda harus berada di lokasi!`, 403);
                }
            } else {
                return { valid: false, status: 'GPS_STRIPPED', message: 'Metadata koordinat (GPS) tidak ditemukan pada foto.' };
            }

            // Skenario Aman: Foto Valid dan Asli
            return { valid: true, status: 'VALID', message: 'Otentisitas foto terverifikasi oleh Sistem.' };

        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('[ExifValidator Error]', error);
            throw new AppError('Terjadi kesalahan sistem saat memvalidasi metadata foto.', 500);
        }
    }
}