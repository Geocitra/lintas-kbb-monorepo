// apps/api/src/services/TicketService.ts
import prisma from '../config/database';
import { AssignTicketDTO, ExecuteTicketDTO, ReviewTicketDTO } from '@dishub/types';
import { AppError } from '../middlewares/errorHandler';
import { slaQueue, waQueue } from '../config/queue'; // IMPORT waQueue
import { ExifValidator } from '../utils/ExifValidator'; // IMPORT ExifValidator

export class TicketService {

    // ==========================================
    // 1. PENUGASAN OLEH ADMIN (SLA Scheduling & WA Notif)
    // ==========================================
    async assignTicket(reportId: string, data: AssignTicketDTO, adminId: string) {
        return await prisma.$transaction(async (tx) => {
            const report = await tx.report.findUnique({ where: { id: reportId }, include: { asset: true } });
            if (!report) throw new AppError('Laporan tidak ditemukan', 404);
            if (!report.asset_id) throw new AppError('Laporan ini belum memiliki aset terkait', 400);

            const ticket = await tx.maintenanceTicket.upsert({
                where: { report_id: reportId },
                update: {
                    technician_id: data.technician_id, prioritas: data.prioritas,
                    instruksi_admin: data.instruksi_admin, deadline_at: data.deadline_at, status: 'DITUGASKAN',
                },
                create: {
                    report_id: reportId, asset_id: report.asset_id, technician_id: data.technician_id,
                    prioritas: data.prioritas, instruksi_admin: data.instruksi_admin, deadline_at: data.deadline_at,
                    status: 'DITUGASKAN',
                }
            });

            await tx.asset.update({
                where: { id: report.asset_id },
                data: { status_operasional: 'DALAM_PERBAIKAN' }
            });

            await tx.assetHistory.create({
                data: {
                    asset_id: report.asset_id, actor_id: adminId, action: 'PENUGASAN_TEKNISI',
                    keterangan: `Tiket ${report.ticket_number} ditugaskan. Deadline: ${data.deadline_at.toISOString()}`,
                }
            });

            // 🕒 BULLMQ 1: JADWALKAN "BOM WAKTU" SLA
            const delayMs = new Date(data.deadline_at).getTime() - Date.now();
            const safeDelay = delayMs > 0 ? delayMs : 1000;

            await slaQueue.add('check-sla-kepatuhan', {
                ticketId: ticket.id, ticketNumber: report.ticket_number,
                technicianId: data.technician_id, assetId: report.asset_id, adminId: adminId
            }, { delay: safeDelay, jobId: `sla-ticket-${ticket.id}` });

            // 📨 BULLMQ 2: TEMBAK NOTIFIKASI WHATSAPP ASINKRON KE TEKNISI
            const technician = await tx.user.findUnique({ where: { id: data.technician_id } });
            if (technician && technician.no_wa) {
                // Dimasukkan ke Queue agar API tidak menunggu (Non-blocking)
                await waQueue.add('send-wa-assignment', {
                    phone: technician.no_wa,
                    ticketNumber: report.ticket_number,
                    message: `*LINTAS KBB TUGAS BARU*\n\nHalo ${technician.name}, Anda mendapat tugas perbaikan untuk tiket *${report.ticket_number}*. Prioritas: ${data.prioritas}.\nSLA Deadline: ${new Date(data.deadline_at).toLocaleString('id-ID')}.\n\nSegera cek aplikasi!`,
                });
            }

            return ticket;
        });
    }

    // ==========================================
    // 2. PENGERJAAN OLEH TEKNISI (Execution Guard & EXIF Validation)
    // ==========================================
    async executeTicket(ticketId: string, data: ExecuteTicketDTO, technicianId: string) {
        // A. Pengecekan Awal Tanpa Transaksi (Agar tidak menahan koneksi DB saat unduh gambar)
        const ticket = await prisma.maintenanceTicket.findUnique({ where: { id: ticketId }, include: { asset: true } });
        if (!ticket) throw new AppError('Tiket tidak ditemukan', 404);
        if (ticket.technician_id !== technicianId) throw new AppError('Akses Ditolak: Anda bukan teknisi yang ditugaskan', 403);
        if (ticket.status !== 'DITUGASKAN' && ticket.status !== 'DIKERJAKAN' && ticket.status !== 'REVIEW_ADMIN') {
            throw new AppError(`Tiket berstatus ${ticket.status} tidak dapat dikerjakan`, 400);
        }

        // B. SOCIO-ENGINEERING GUARD (ANTI-FRAUD EXIF)
        // Kita unduh foto_hasil yang diupload Teknisi dari URL-nya (Cloud/Local) ke bentuk Buffer
        if (ticket.asset && ticket.asset.lat && ticket.asset.lng) {
            try {
                console.log(`[EXIF GUARD] Mengunduh gambar untuk verifikasi: ${data.foto_hasil}`);
                const response = await fetch(data.foto_hasil);
                if (!response.ok) throw new Error('Gagal mengunduh gambar');

                const arrayBuffer = await response.arrayBuffer();
                const imageBuffer = Buffer.from(arrayBuffer);

                // Jalankan Detektif EXIF (Akan melempar AppError jika terdeteksi Fraud)
                const validationResult = await ExifValidator.validateJobPhoto(
                    imageBuffer,
                    ticket.createdAt, // Waktu penugasan
                    ticket.asset.lat,
                    ticket.asset.lng,
                    50 // Toleransi 50 meter
                );

                console.log(`[EXIF GUARD] Status Foto: ${validationResult.status}`);
            } catch (err: any) {
                // Jika AppError (Fraud terdeteksi), lemparkan ke user!
                if (err instanceof AppError) throw err;
                console.error('[EXIF GUARD ERROR]', err);
                // Jika error fetch atau gambar tidak bisa dibaca, kita biarkan lewat tapi beri peringatan di DB nanti
            }
        }

        // C. Simpan ke Database
        return await prisma.$transaction(async (tx) => {
            const updatedTicket = await tx.maintenanceTicket.update({
                where: { id: ticketId },
                data: {
                    catatan_teknisi: data.catatan_teknisi,
                    foto_hasil: data.foto_hasil,
                    status: 'REVIEW_ADMIN', // Wajib Review, tidak bisa langsung selesai
                    finished_at: new Date()
                }
            });

            await tx.assetHistory.create({
                data: {
                    asset_id: ticket.asset_id, actor_id: technicianId, action: 'TEKNISI_MELAPOR_SELESAI',
                    keterangan: `Teknisi melapor perbaikan selesai. Menunggu validasi (Review) Admin.`,
                }
            });

            return updatedTicket;
        });
    }

    // ==========================================
    // 3. REVIEW OLEH ADMIN (Quality Control)
    // ==========================================
    async reviewTicket(ticketId: string, data: ReviewTicketDTO, adminId: string) {
        return await prisma.$transaction(async (tx) => {
            const ticket = await tx.maintenanceTicket.findUnique({ where: { id: ticketId }, include: { report: true } });
            if (!ticket || ticket.status !== 'REVIEW_ADMIN') throw new AppError('Tiket tidak dalam status REVIEW_ADMIN', 400);

            if (data.keputusan === 'APPROVE') {
                const closedTicket = await tx.maintenanceTicket.update({
                    where: { id: ticketId }, data: { status: 'SELESAI' }
                });

                await tx.asset.update({
                    where: { id: ticket.asset_id }, data: { kondisi: 'BAIK', status_operasional: 'AKTIF' }
                });

                await tx.report.update({
                    where: { id: ticket.report_id }, data: { is_valid: true }
                });

                await tx.assetHistory.create({
                    data: {
                        asset_id: ticket.asset_id, actor_id: adminId, action: 'REVIEW_DISETUJUI',
                        keterangan: `Admin menyetujui hasil perbaikan. Catatan: ${data.catatan_review}`,
                    }
                });

                // 📨 BULLMQ: KIRIM WA KE WARGA PELAPOR BAHWA KASUS SELESAI
                if (ticket.report.kontak_pelapor) {
                    await waQueue.add('send-wa-resolved', {
                        phone: ticket.report.kontak_pelapor,
                        ticketNumber: ticket.report.ticket_number,
                        message: `*UPDATE LINTAS KBB*\n\nYth. Pelapor,\nLaporan Anda dengan Tiket *${ticket.report.ticket_number}* telah SELESAI diperbaiki oleh teknisi kami. Terima kasih atas partisipasi Anda dalam menjaga fasilitas KBB.`
                    });
                }

                return closedTicket;

            } else {
                const rejectedTicket = await tx.maintenanceTicket.update({
                    where: { id: ticketId }, data: { status: 'DIKERJAKAN', finished_at: null }
                });

                await tx.assetHistory.create({
                    data: {
                        asset_id: ticket.asset_id, actor_id: adminId, action: 'REVIEW_DITOLAK',
                        keterangan: `Admin MENOLAK hasil perbaikan. Dikembalikan ke Teknisi. Alasan: ${data.catatan_review}`,
                    }
                });

                return rejectedTicket;
            }
        });
    }

    // ==========================================
    // 4. DAFTAR TIKET TEKNISI (My Tasks)
    // ==========================================
    async getTechnicianTickets(technicianId: string) {
        return await prisma.maintenanceTicket.findMany({
            where: { technician_id: technicianId },
            include: {
                report: true,
                asset: { include: { kategori: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // ==========================================
    // 5. DAFTAR SEMUA TIKET (Admin)
    // ==========================================
    async getAllTickets(page: number = 1, limit: number = 10, status?: any) {
        const skip = (page - 1) * limit;
        const where: any = {};
        if (status) {
            where.status = status;
        }

        const [tickets, total] = await Promise.all([
            prisma.maintenanceTicket.findMany({
                where,
                skip,
                take: limit,
                include: {
                    report: true,
                    asset: { include: { kategori: true } },
                    technician: { select: { id: true, name: true, role: true, nip: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.maintenanceTicket.count({ where })
        ]);

        return { tickets, total };
    }
}