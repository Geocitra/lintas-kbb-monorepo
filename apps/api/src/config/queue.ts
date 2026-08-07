// apps/api/src/config/queue.ts
import { Queue, ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// BullMQ MEWAJIBKAN opsi maxRetriesPerRequest: null untuk klien Redis-nya
const redisConnection: ConnectionOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
};

// 1. Klien Redis yang bisa dipakai ulang (Reusable Connection)
export const redisClient = new IORedis(redisConnection);

redisClient.on('connect', () => {
    console.log('🟢 [Redis] Berhasil terhubung ke server Redis');
});

redisClient.on('error', (err) => {
    console.error('🔴 [Redis Error] Gagal terhubung ke Redis. Pastikan service Redis menyala:', err.message);
});

// ==========================================
// DAFTAR ANTREAN (QUEUE CHANNELS)
// ==========================================

// 2A. Antrean Khusus untuk Penjadwalan Deadline (Service Level Agreement)
export const SLA_QUEUE_NAME = 'SLA_ESCALATION_QUEUE';
export const slaQueue = new Queue(SLA_QUEUE_NAME, { connection: redisClient });

// 2B. Antrean Khusus untuk Asynchronous Notification (WA/Email)
export const WA_QUEUE_NAME = 'WA_NOTIFICATION_QUEUE';
export const waQueue = new Queue(WA_QUEUE_NAME, {
    connection: redisClient,
    defaultJobOptions: {
        attempts: 3, // Auto-retry 3 kali jika server WA down
        backoff: {
            type: 'exponential',
            delay: 5000 // Jeda 5s, lalu 10s, lalu 20s
        }
    }
});