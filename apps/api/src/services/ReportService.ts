// apps/api/src/services/ReportService.ts
import prisma from '../config/database';
import { CreatePublicReportDTO } from '@dishub/types';
import { SpatialService } from './SpatialService';

const spatialService = new SpatialService();

export class ReportService {

    /**
     * 1. CREATE PUBLIC REPORT (Socio-Engineering Logic)
     * Mengevaluasi apakah laporan valid atau terdeteksi sebagai SPAM/Fake GPS
     */
    async processPublicReport(data: CreatePublicReportDTO) {
        let isSpam = false;
        let detectedAssetId = data.asset_id;

        // A. Validasi Jarak jika Warga memilih aset secara manual
        if (detectedAssetId) {
            const distance = await spatialService.getAbsoluteDistance(detectedAssetId, data.lat, data.lng);

            if (distance === null) {
                detectedAssetId = null; // Aset tidak ditemukan
            } else if (distance > 50) {
                // Pelapor berada > 50 meter dari Aset. Tandai sebagai SPAM.
                isSpam = true;
            }
        }
        // B. Jika Warga tidak memilih aset, sistem cari otomatis dalam radius 50m
        else {
            const nearest = await spatialService.findNearestAssets(data.lat, data.lng, 50);

            if (nearest.length > 0) {
                detectedAssetId = nearest[0].id; // Assign aset terdekat
            } else {
                // Tidak ada aset milik Dishub di kordinat warga. SPAM / Ngawur.
                isSpam = true;
            }
        }

        // C. Eksekusi ke Database secara Atomik
        const ticketNum = `LP-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

        const report = await prisma.$transaction(async (tx) => {
            // 1. Simpan tabel Report
            const rep = await tx.report.create({
                data: {
                    ticket_number: ticketNum,
                    sumber_pelapor: 'MASYARAKAT',
                    nama_pelapor: data.nama_pelapor,
                    kontak_pelapor: data.kontak_pelapor,
                    judul_laporan: data.judul_laporan,
                    deskripsi: data.deskripsi,
                    lat: data.lat,
                    lng: data.lng,
                    foto_kejadian: data.foto_kejadian || null,
                    asset_id: detectedAssetId,
                    is_valid: !isSpam // False jika SPAM
                }
            });

            // 2. Injeksi Koordinat PostGIS
            await tx.$executeRaw`
        UPDATE "Report" 
        SET geom = ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326) 
        WHERE id = ${rep.id}
      `;

            // 3. Ubah Aset menjadi KRITIS jika laporan VALID (Bukan SPAM)
            if (!isSpam && detectedAssetId) {
                await tx.asset.update({
                    where: { id: detectedAssetId },
                    data: { kondisi: 'KRITIS' } // Ini akan memicu alert di Dashboard Kadis
                });
            }

            return rep;
        });

        return {
            report,
            isSpam
        };
    }

    // ==========================================
    // 2. DAFTAR SEMUA LAPORAN (Admin)
    // ==========================================
    async getAllReports(page: number = 1, limit: number = 10, isValid?: boolean) {
        const skip = (page - 1) * limit;
        const where: any = {};
        if (isValid !== undefined) {
            where.is_valid = isValid;
        }

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where,
                skip,
                take: limit,
                include: {
                    asset: { include: { kategori: true } },
                    maintenance_ticket: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.report.count({ where })
        ]);

        return { reports, total };
    }
}