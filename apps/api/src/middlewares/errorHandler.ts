// apps/api/src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '@dishub/types';

// Custom Error Class untuk Business Logic
export class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: any,
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
) => {
    console.error('[Error Logger]:', err);

    // 1. Zod Validation Error (Dari Payload Frontend)
    if (err instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        err.issues.forEach((e) => {
            const field = e.path.join('.');
            if (!formattedErrors[field]) formattedErrors[field] = [];
            formattedErrors[field].push(e.message);
        });

        return res.status(400).json({
            success: false,
            message: 'Validasi data gagal. Periksa kembali input Anda.',
            errors: formattedErrors,
        });
    }

    // 2. Custom Business Logic Error
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    // 3. Prisma Database Error (Contoh: Unique Constraint Violation)
    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            message: 'Data bentrok (Conflict). Terdapat duplikasi data unik di sistem.',
        });
    }

    // 4. Default Server Error (Fallback)
    return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan internal pada server.',
    });
};