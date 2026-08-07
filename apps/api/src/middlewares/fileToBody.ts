// apps/api/src/middlewares/fileToBody.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware untuk menyuntikkan path file Multer ke dalam req.body
 * agar Zod bisa melakukan validasi.
 * 
 * @param targetField Nama field di Zod Schema (contoh: 'foto_kejadian')
 * @param folderName Nama subfolder tempat file disimpan (contoh: 'reports')
 */
export const fileToBody = (targetField: string, folderName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {

        // Jika ada file yang berhasil di-upload oleh Multer
        if (req.file) {
            // Kita buat URL Path relatif (Contoh output: "/uploads/reports/1718291029-a1b2c3.jpg")
            // Path ini yang akan disimpan ke database PostgreSQL
            const localPath = `/uploads/${folderName}/${req.file.filename}`;

            req.body[targetField] = localPath;
        }

        // Lanjutkan perjalanan ke Zod Validation / Controller berikutnya
        next();
    };
};