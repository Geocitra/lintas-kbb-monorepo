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
        // A. Single file upload (.single())
        if (req.file) {
            req.body[targetField] = `/uploads/${folderName}/${req.file.filename}`;
        }

        // B. Multiple files upload / fields (.fields() or .array())
        if (req.files) {
            // 1. Jika di-upload menggunakan .array()
            if (Array.isArray(req.files)) {
                req.body[targetField] = req.files.map(f => `/uploads/${folderName}/${f.filename}`);
            } 
            // 2. Jika di-upload menggunakan .fields()
            else {
                // Map primary 'foto' ke targetField (foto_kejadian atau foto_hasil)
                if (req.files['foto'] && req.files['foto'][0]) {
                    req.body[targetField] = `/uploads/${folderName}/${req.files['foto'][0].filename}`;
                }
                
                // Map 'foto_tambahan' ke req.body.foto_tambahan
                if (req.files['foto_tambahan']) {
                    req.body['foto_tambahan'] = req.files['foto_tambahan'].map(
                        f => `/uploads/${folderName}/${f.filename}`
                    );
                }
            }
        }

        next();
    };
};