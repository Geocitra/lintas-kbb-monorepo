// apps/api/src/routes/dashboardRoutes.ts
import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticateJWT, authorizeRole } from '../middlewares/auth';

const router = Router();

// Wajib Login dan Wajib memiliki jabatan/otoritas Eksekutif
router.use(authenticateJWT, authorizeRole(['KADIS', 'ADMIN']));

// Ambil Statistik Agregasi untuk Grafik UI
router.get('/stats', DashboardController.getStats);

// Fitur Unduh Dokumen (Export)
router.get('/export/excel', DashboardController.exportExcel);
router.get('/export/pdf', DashboardController.exportPdf);

export default router;