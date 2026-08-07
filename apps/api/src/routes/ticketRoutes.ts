// apps/api/src/routes/ticketRoutes.ts
import { Router } from 'express';
import { TicketController } from '../controllers/TicketController';
import { authenticateJWT, authorizeRole } from '../middlewares/auth';
import { uploadImage } from '../middlewares/uploadHandler';
import { fileToBody } from '../middlewares/fileToBody';

const router = Router();

// Semua rute tiket wajib login
router.use(authenticateJWT);

// GET /api/v1/tickets/my-tasks (Teknisi)
router.get('/my-tasks', authorizeRole(['TEKNISI', 'KASI']), TicketController.myTasks);

// GET /api/v1/tickets (Admin/Kadis/Kasi)
router.get('/', authorizeRole(['ADMIN', 'KADIS', 'KASI']), TicketController.index);

// 1. ADMIN/KADIS -> Assign Tugas ke Teknisi
// Endpoint: POST /api/v1/tickets/:report_id/assign
router.post('/:report_id/assign', authorizeRole(['ADMIN', 'KADIS', 'KASI']), TicketController.assign);

// 2. TEKNISI -> Submit Pekerjaan (Membawa Foto Bukti)
// Endpoint: POST /api/v1/tickets/:ticket_id/execute
router.post(
    '/:ticket_id/execute',
    authorizeRole(['TEKNISI', 'KASI']),
    uploadImage('tickets').fields([
        { name: 'foto', maxCount: 1 },
        { name: 'foto_tambahan', maxCount: 5 }
    ]),
    fileToBody('foto_hasil', 'tickets'),
    TicketController.execute
);

// 3. ADMIN/KASI -> Review Hasil Pekerjaan Teknisi
// Endpoint: POST /api/v1/tickets/:ticket_id/review
router.post('/:ticket_id/review', authorizeRole(['ADMIN', 'KASI']), TicketController.review);

export default router;