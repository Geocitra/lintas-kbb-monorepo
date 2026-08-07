// apps/api/src/routes/reportRoutes.ts
import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { uploadImage } from '../middlewares/uploadHandler';
import { fileToBody } from '../middlewares/fileToBody';
import { authenticateJWT, authorizeRole } from '../middlewares/auth';

const router = Router();

// Endpoint Publik: Menerima laporan dari halaman depan website (Tanpa JWT)
// POST /api/v1/reports/public
router.post(
    '/public',
    uploadImage('reports').single('foto'),     // Sedot file gambar maksimal 5MB ke folder 'reports'
    fileToBody('foto_kejadian', 'reports'),    // Ubah local path menjadi body 'foto_kejadian' untuk Zod
    ReportController.submitPublicReport
);

// Endpoint Privat: Daftar Laporan Masuk (Admin/Kadis/Kasi)
// GET /api/v1/reports
router.get('/', authenticateJWT, authorizeRole(['ADMIN', 'KADIS', 'KASI']), ReportController.index);

export default router;