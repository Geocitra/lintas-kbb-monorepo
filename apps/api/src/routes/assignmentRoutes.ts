// apps/api/src/routes/assignmentRoutes.ts
import { Router } from 'express';
import { AssignmentController } from '../controllers/AssignmentController';
import { authenticateJWT, authorizeRole } from '../middlewares/auth';

const router = Router();

// HANYA Admin dan Kepala Dinas yang boleh mengatur mutasi/peminjaman aset!
router.use(authenticateJWT, authorizeRole(['ADMIN', 'KADIS']));

// List semua peminjaman/penugasan
router.get('/', AssignmentController.listAssignments);

// Serah terima aset ke User (Pegawai)
router.post('/handover', AssignmentController.assignToUser);

// Mengembalikan aset dari User ke Gudang
router.post('/return/:asset_id', AssignmentController.returnToGudang);

export default router;
