// apps/api/src/controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserLoginSchema } from '@dishub/types';

const authService = new AuthService();

export class AuthController {

    // Endpoint: POST /api/v1/auth/login
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. Zod Gatekeeper: Tolak jika identifier atau password kosong / tidak sesuai format
            const validData = UserLoginSchema.parse(req.body);

            // 2. Lempar ke Information Expert (Service)
            const { token, user } = await authService.login(validData);

            // 3. Beri Response 200 OK
            res.status(200).json({
                success: true,
                message: 'Otentikasi berhasil. Selamat datang kembali!',
                data: {
                    token,
                    user
                }
            });
        } catch (error) {
            next(error); // Error otomatis ditangkap oleh global errorHandler
        }
    }

    // Endpoint: GET /api/v1/auth/me
    static async me(req: Request, res: Response, next: NextFunction) {
        try {
            // req.user diisi otomatis oleh middleware authenticateJWT
            const userId = req.user!.id;

            const user = await authService.getMe(userId);

            res.status(200).json({
                success: true,
                message: 'Profil pengguna berhasil dimuat',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }
}