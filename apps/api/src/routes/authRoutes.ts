// apps/api/src/routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================
// Tidak butuh token untuk bisa login
router.post('/login', AuthController.login);

// ==========================================
// PROTECTED ENDPOINTS
// ==========================================
// Harus menyertakan "Authorization: Bearer <token>" di header
router.get('/me', authenticateJWT, AuthController.me);

// ADMIN ONLY — Manajemen User
router.get('/users', authenticateJWT, AuthController.getAllUsers);

export default router;