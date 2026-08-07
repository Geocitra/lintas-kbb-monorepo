// apps/api/src/routes/masterRoutes.ts
import { Router } from 'express';
import { MasterController } from '../controllers/MasterController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// Endpoint Publik: Dropdown Kategori
router.get('/categories', MasterController.categories);

// Endpoint Publik: Dropdown Seksi/Bidang
router.get('/seksi', MasterController.seksi);

// Endpoint Privat: Dropdown Daftar Pegawai (Butuh Login)
router.get('/users', authenticateJWT, MasterController.employees);

export default router;
