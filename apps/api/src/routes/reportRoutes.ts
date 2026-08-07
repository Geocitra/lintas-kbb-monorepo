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
    uploadImage('reports').fields([
        { name: 'foto', maxCount: 1 },
        { name: 'foto_tambahan', maxCount: 5 }
    ]),
    fileToBody('foto_kejadian', 'reports'),
    ReportController.submitPublicReport
);

// Endpoint Publik: Melacak status laporan berdasarkan nomor tiket (Tanpa JWT)
// GET /api/v1/reports/public/track/:ticket_number
router.get('/public/track/:ticket_number', ReportController.trackPublicReport);

// Endpoint Privat: Daftar Laporan Masuk (Admin/Kadis/Kasi)
// GET /api/v1/reports
router.get('/', authenticateJWT, authorizeRole(['ADMIN', 'KADIS', 'KASI']), ReportController.index);

export default router;