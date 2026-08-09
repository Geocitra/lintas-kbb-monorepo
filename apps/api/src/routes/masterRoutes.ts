// apps/api/src/routes/masterRoutes.ts
import { Router } from 'express';
import { MasterController } from '../controllers/MasterController';
import { authenticateJWT, authorizeRole } from '../middlewares/auth';

const router = Router();

// Dropdowns (Public/Authenticated read)
router.get('/categories', MasterController.categories);
router.get('/seksi',      MasterController.seksi);
router.get('/users',      authenticateJWT, MasterController.employees);

// CRUD Kategori (ADMIN ONLY)
router.post('/categories',      authenticateJWT, authorizeRole(['ADMIN']), MasterController.createCategory);
router.put('/categories/:id',    authenticateJWT, authorizeRole(['ADMIN']), MasterController.updateCategory);
router.delete('/categories/:id', authenticateJWT, authorizeRole(['ADMIN']), MasterController.deleteCategory);

// CRUD Seksi (ADMIN ONLY)
router.post('/seksi',      authenticateJWT, authorizeRole(['ADMIN']), MasterController.createSeksi);
router.put('/seksi/:id',    authenticateJWT, authorizeRole(['ADMIN']), MasterController.updateSeksi);
router.delete('/seksi/:id', authenticateJWT, authorizeRole(['ADMIN']), MasterController.deleteSeksi);

export default router;
