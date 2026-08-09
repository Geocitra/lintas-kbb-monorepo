import prisma from '../config/database';
import { CreatePublicReportDTO } from '@dishub/types';
import { AppError } from '../middlewares/errorHandler';
import { SpatialService } from './SpatialService';
import { SocketServer } from '../utils/SocketServer';

const spatialService = new SpatialService();

export class ReportService {

    /**
     * 1. CREATE PUBLIC REPORT (Socio-Engineering Logic)
     * Mengevaluasi apakah laporan valid atau terdeteksi sebagai SPAM/Fake GPS
     */
    async processPublicReport(data: CreatePublicReportDTO) {
        let isSpam = false;
        let detectedAssetId = data.asset_id;
        let isMerged = false;

        // A. Validasi Jarak: Jarak GPS Pelapor harus dekat dengan Aset (Toleransi 50 meter)
        if (detectedAssetId) {
            const distance = await spatialService.getAbsoluteDistance(detectedAssetId, data.lat, data.lng);

            if (distance === null || distance > 50) {
                // Pelapor berada > 50 meter dari Aset. Tandai sebagai SPAM.
                isSpam = true;
            }
        } else {
            isSpam = true; // Asset ID wajib dikirim oleh warga
        }

        // B. Silent Merge: Cek apakah sudah ada tiket perbaikan aktif untuk aset ini
        if (!isSpam && detectedAssetId) {
            const activeTicket = await prisma.maintenanceTicket.findFirst({
                where: {
                    asset_id: detectedAssetId,
                    status: {
                        in: ['TERVALIDASI', 'DITUGASKAN', 'DIKERJAKAN', 'REVIEW_ADMIN']
                    }
                }
            });

            if (activeTicket) {
                // Laporan digabung secara senyap karena tiket sedang berjalan
                isMerged = true;
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
                    nama_pelapor: null, // Dihapus dari form warga untuk privasi
                    kontak_pelapor: data.kontak_pelapor,
                    judul_laporan: data.judul_laporan,
                    deskripsi: data.deskripsi,
                    kategori_kerusakan: data.kategori_kerusakan,
                    lat: data.lat,
                    lng: data.lng,
                    foto_kejadian: data.foto_kejadian || null,
                    foto_tambahan: data.foto_tambahan ?? [],
                    asset_id: detectedAssetId,
                    is_valid: !isSpam, // False jika SPAM
                    is_merged: isMerged
                }
            });

            // 2. Injeksi Koordinat PostGIS
            await tx.$executeRaw`
                UPDATE "Report" 
                SET geom = ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326) 
                WHERE id = ${rep.id}
            `;

            // 3. Ubah Aset menjadi KRITIS jika laporan VALID (Bukan SPAM) dan tidak di-merge
            if (!isSpam && !isMerged && detectedAssetId) {
                await tx.asset.update({
                    where: { id: detectedAssetId },
                    data: { kondisi: 'KRITIS' } // Ini akan memicu alert di Dashboard Kadis
                });
            }

            return rep;
        });

        // 🔌 WEBSOCKET: Pancarkan real-time update ke Room Admin
        SocketServer.emitToRoom('ADMIN_ROOM', 'NEW_REPORT', report);

        return {
            report,
            isSpam
        };
    }

    // ==========================================
    // 2. DAFTAR SEMUA LAPORAN (Admin)
    // ==========================================

    async getAllReports(page: number = 1, limit: number = 10, isValid?: boolean, seksiId?: string) {
        const skip = (page - 1) * limit;
        const where: any = {};
        if (isValid !== undefined) {
            where.is_valid = isValid;
        }
        if (seksiId) {
            where.asset = {
                kategori: {
                    seksi_id: seksiId
                }
            };
        }

        const [rawReports, total] = await Promise.all([
            prisma.report.findMany({
                where,
                skip,
                take: limit,
                include: {
                    asset: { include: { kategori: { include: { seksi: true } } } },
                    maintenance_ticket: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.report.count({ where })
        ]);

        // REFACTOR (DTO Mapping): Menghindari UI crash karena missing property "status". 
        // Mengimplementasikan Information Expert pattern untuk formatting data di API level.
        const formattedReports = rawReports.map((report) => {
            let derivedStatus = 'LAPORAN_MASUK';

            if (report.maintenance_ticket?.status) {
                derivedStatus = report.maintenance_ticket.status;
            } else if (report.is_valid === false) {
                derivedStatus = 'DITOLAK'; // atau SPAM
            }

            return {
                ...report,
                status: derivedStatus // Flattens status property untuk kemudahan konsumsi tabel React
            };
        });

        return { reports: formattedReports, total };
    }

    // ==========================================
    // 3. STATUS TRACKING PUBLIK (Stateless)
    // ==========================================

    async getPublicReportStatus(ticketNumber: string) {
        const report = await prisma.report.findUnique({
            where: { ticket_number: ticketNumber },
            include: {
                asset: {
                    select: {
                        nama_aset: true,
                        kondisi: true
                    }
                },
                maintenance_ticket: {
                    select: {
                        status: true,
                        deadline_at: true,
                        finished_at: true,
                        foto_hasil: true,
                        foto_tambahan: true
                    }
                }
            }
        });

        if (!report) {
            throw new AppError('Nomor tiket laporan tidak ditemukan', 404);
        }

        // Jika laporan di-merge (Silent Merge), status perbaikannya menempel pada tiket aktif milik Aset tersebut
        let ticketInfo = report.maintenance_ticket;
        if (report.is_merged && report.asset_id && !ticketInfo) {
            ticketInfo = await prisma.maintenanceTicket.findFirst({
                where: { asset_id: report.asset_id },
                orderBy: { createdAt: 'desc' },
                select: {
                    status: true,
                    deadline_at: true,
                    finished_at: true,
                    foto_hasil: true,
                    foto_tambahan: true
                }
            });
        }

        // Return data aman (tanpa data pribadi warga seperti kontak penuh)
        return {
            ticket_number: report.ticket_number,
            judul_laporan: report.judul_laporan,
            deskripsi: report.deskripsi,
            kategori_kerusakan: report.kategori_kerusakan,
            lat: report.lat,
            lng: report.lng,
            foto_kejadian: report.foto_kejadian,
            foto_tambahan: report.foto_tambahan,
            is_valid: report.is_valid,
            is_merged: report.is_merged,
            createdAt: report.createdAt,
            asset: report.asset,
            status: ticketInfo ? ticketInfo.status : (report.is_valid ? 'LAPORAN_MASUK' : 'SPAM'),
            progress: ticketInfo ?? null
        };
    }
}