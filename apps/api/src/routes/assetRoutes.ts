// apps/api/src/routes/assetRoutes.ts
import { Router } from 'express';
import { AssetController } from '../controllers/AssetController';
import { authenticateJWT, authorizeRole } from '../middlewares/auth';
import { uploadImage } from '../middlewares/uploadHandler';
import { fileToBody } from '../middlewares/fileToBody';

const router = Router();

router.use(authenticateJWT);

// Endpoint Standar
router.get('/', AssetController.index);
router.get('/:id', AssetController.show);

// Menambah Aset Baru (Bisa menyertakan Foto Utama)
router.post(
    '/',
    authorizeRole(['ADMIN', 'KADIS']),
    uploadImage('assets').single('foto'),
    fileToBody('foto_utama', 'assets'),
    AssetController.create
);

router.delete('/:id', authorizeRole(['ADMIN']), AssetController.destroy);

// ==========================================
// ENDPOINT BARU FASE 2
// ==========================================

// Pengadaan Massal (Hanya Admin & Kadis)
router.post('/procurement/bulk', authorizeRole(['ADMIN', 'KADIS']), AssetController.bulkProcurement);

// Sensus Lapangan (Hanya Teknisi & Kasi yang sedang patroli) - Membawa Foto Bukti
router.post(
    '/field-census',
    authorizeRole(['TEKNISI']),
    uploadImage('assets').single('foto'),
    fileToBody('foto_utama', 'assets'),
    AssetController.fieldCensus
);

export default router;