// apps/api/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { Role } from '@dishub/types';

// Extend Express Request untuk menampung data User
declare global {
    namespace Express {
        interface Request {
            user?: { id: string; role: Role; seksi_id?: string | null };
        }
    }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Akses ditolak. Token tidak ditemukan.', 401);
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'fallback_secret';

        const decoded = jwt.verify(token, secret) as any;
        req.user = {
            id: decoded.id,
            role: decoded.role,
            seksi_id: decoded.seksi_id,
        };

        next();
    } catch (error) {
        next(new AppError('Token tidak valid atau sudah kedaluwarsa.', 401));
    }
};

// Middleware Factory untuk otorisasi berdasarkan Role
export const authorizeRole = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return next(new AppError('Akses terlarang. Anda tidak memiliki wewenang (Hak Akses).', 403));
        }
        next();
    };
};