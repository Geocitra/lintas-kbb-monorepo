// apps/api/src/routes/announcementRoutes.ts
import { Router } from 'express';
import { AnnouncementController } from '../controllers/AnnouncementController';
import { authenticateJWT, authorizeRole } from '../middlewares/auth';

const router = Router();

// Semua rute pengumuman mewajibkan login
router.use(authenticateJWT);

// ==========================================
// RUTE GLOBAL (Bisa diakses Teknisi, Kasi, Admin, Kadis)
// ==========================================

// Mendapatkan daftar pengumuman (Feed)
router.get('/', AnnouncementController.index);

// Endpoint rahasia yang ditembak Frontend di background saat aplikasi dibuka
router.get('/urgent', AnnouncementController.getUrgent);

// Teknisi menekan tombol "Saya Mengerti"
router.post('/:id/ack', AnnouncementController.acknowledge);


// ==========================================
// RUTE RESTRICTED (Hanya untuk Eksekutif / Admin)
// ==========================================

// Membuat pengumuman baru
router.post('/', authorizeRole(['ADMIN', 'KADIS']), AnnouncementController.create);

export default router;