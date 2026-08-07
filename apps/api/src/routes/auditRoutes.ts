// apps/api/src/routes/auditRoutes.ts
import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';
import { authenticateJWT, authorizeRole } from '../middlewares/auth';

const router = Router();

// HANYA Admin dan Kepala Dinas yang boleh melihat jejak rekam (Audit)
router.use(authenticateJWT, authorizeRole(['ADMIN', 'KADIS']));

// Endpoint: GET /api/v1/audit/histories
router.get('/histories', AuditController.index);

export default router;