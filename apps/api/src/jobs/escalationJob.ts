// apps/api/src/jobs/escalationJob.ts
import { Worker, Job } from 'bullmq';
import { SLA_QUEUE_NAME, redisClient } from '../config/queue';
import prisma from '../config/database';

/**
 * Fungsi ini akan dipanggil di index.ts agar Worker berjalan di latar belakang (Background Process).
 * Ia memisahkan beban kerja ini dari Main Thread HTTP Express.
 */
export const setupEscalationWorker = () => {

    const worker = new Worker(SLA_QUEUE_NAME, async (job: Job) => {
        // Data yang kita simpan saat admin menugaskan tiket (di Fase 3 nanti)
        const { ticketId, ticketNumber, technicianName, assetId, adminId } = job.data;

        console.log(`[BullMQ Worker] 🕒 Memeriksa kepatuhan SLA untuk tiket: ${ticketNumber}...`);

        // 1. Cek status tiket TERBARU langsung dari Database
        const ticket = await prisma.maintenanceTicket.findUnique({
            where: { id: ticketId },
            select: { status: true }
        });

        if (!ticket) return;

        // 2. LOGIKA SOCIO-ENGINEERING: 
        // Jika statusnya masih DITUGASKAN atau DIKERJAKAN saat waktu deadline ini tiba, 
        // berarti Teknisi melanggar Service Level Agreement (SLA Breach).
        if (ticket.status === 'DITUGASKAN' || ticket.status === 'DIKERJAKAN') {

            console.error(`🚨 [SLA BREACH!] Peringatan! Tiket ${ticketNumber} melewati batas waktu. Teknisi: ${technicianName} belum melapor selesai.`);

            // Aksi: Catat pelanggaran ke Audit Trail (AssetHistory) agar Kepala Dinas bisa melihat Kinerja Buruk
            await prisma.assetHistory.create({
                data: {
                    asset_id: assetId,
                    actor_id: adminId, // System yang mewakili Admin
                    action: 'SLA_BREACH_ALERT',
                    keterangan: `SISTEM OTOMATIS: Pelanggaran batas waktu (SLA) oleh teknisi ${technicianName} untuk tiket ${ticketNumber}.`,
                }
            });

            // Di masa depan: Integrasi API WhatsApp Gateway di sini
            // await sendWhatsApp(kadisPhone, `Lapor Ndan, Tiket ${ticketNumber} terlantar!`);

        } else {
            // Jika statusnya REVIEW_ADMIN, SELESAI, atau DITOLAK, berarti aman.
            console.log(`✅ [SLA AMAN] Tiket ${ticketNumber} sudah ditangani (Status: ${ticket.status}). Tidak ada eskalasi.`);
        }

    }, { connection: redisClient });

    // Error Handler
    worker.on('failed', (job, err) => {
        console.error(`❌ [BullMQ Error] Job Escalation (ID: ${job?.id}) gagal tereksekusi:`, err.message);
    });

    console.log(`👷 [BullMQ] SLA Worker siap memantau bom waktu deadline tiket...`);
};