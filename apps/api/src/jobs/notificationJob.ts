// apps/api/src/jobs/notificationJob.ts
import { Worker, Job } from 'bullmq';
import { WA_QUEUE_NAME, redisClient } from '../config/queue';

/**
 * Worker ini akan menangkap tugas dari WA_QUEUE_NAME.
 * Worker dipanggil di index.ts agar berjalan paralel.
 */
export const setupNotificationWorker = () => {

    const worker = new Worker(WA_QUEUE_NAME, async (job: Job) => {
        const { phone, message, ticketNumber } = job.data;

        console.log(`[BullMQ Worker] 📨 Mencoba mengirim pesan WA ke ${phone} (Tiket: ${ticketNumber || 'N/A'})...`);

        // Ambil URL Gateway pihak ketiga dari Environment (Atau fallback ke localhost)
        const gatewayUrl = process.env.WA_GATEWAY_URL || 'http://localhost:3000/send-message';

        try {
            // Menembak API WhatsApp (Fetch API native Node.js 18+)
            const response = await fetch(gatewayUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, message })
            });

            if (!response.ok) {
                throw new Error(`Gateway WA merespons dengan HTTP Status: ${response.status}`);
            }

            console.log(`[BullMQ Worker] ✅ Pesan WA ke ${phone} berhasil dikirim!`);

        } catch (error: any) {
            console.error(`[BullMQ Worker] ❌ Gagal mengirim WA ke ${phone}. Error: ${error.message}`);
            // Lempar error agar BullMQ menyadari job ini gagal dan melakukan Auto-Retry sesuai opsi 'backoff'
            throw error;
        }

    }, { connection: redisClient });

    // Error Handler di level Worker
    worker.on('failed', (job, err) => {
        console.error(`⚠️ [BullMQ Warning] Job WA (ID: ${job?.id}) mencapai limit gagal:`, err.message);
    });

    console.log(`👷 [BullMQ] Notification Worker (WA/Email) siap mengeksekusi antrean pesan...`);
};