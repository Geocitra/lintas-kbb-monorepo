// apps/api/src/middlewares/uploadHandler.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { AppError } from './errorHandler';
import { Request } from 'express';

// Fungsi dinamis untuk menentukan lokasi folder (misal: 'assets', 'reports', 'tickets')
const getStorage = (folderName: string) => multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        // Arahkan ke folder public/uploads/ di dalam apps/api
        const destDir = path.join(process.cwd(), `public/uploads/${folderName}`);

        // Auto-create folder jika belum ada (Socio-Engineering: Developer sering lupa bikin folder manual)
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        cb(null, destDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Membuat nama acak: Timestamp + 6 Karakter Random Hex + Ekstensi Asli
        // Contoh: 1718291029-a1b2c3.jpg
        const uniqueSuffix = crypto.randomBytes(6).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
    }
});

// Filter Keamanan: HANYA izinkan format gambar yang aman
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Tolak langsung di pintu depan sebelum masuk memori
        cb(new AppError('Format file ditolak! Keamanan sistem hanya mengizinkan file gambar (JPG, PNG, WEBP).', 415));
    }
};

/**
 * Factory Function untuk Middleware Upload.
 * Penggunaan di router: uploadImage('reports').single('foto')
 */
export const uploadImage = (folderName: string) => {
    return multer({
        storage: getStorage(folderName),
        limits: {
            fileSize: 5 * 1024 * 1024, // HARD LIMIT: 5 Megabytes (Mencegah DDoS Storage)
        },
        fileFilter: imageFilter
    });
};