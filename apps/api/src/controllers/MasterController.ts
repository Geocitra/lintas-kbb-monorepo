// apps/api/src/controllers/MasterController.ts
import { Request, Response, NextFunction } from 'express';
import { MasterService } from '../services/MasterService';

const masterService = new MasterService();

export class MasterController {
    static async categories(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await masterService.getCategories();
            res.status(200).json({
                success: true,
                message: 'Daftar kategori berhasil dimuat',
                data
            });
        } catch (error) { next(error); }
    }

    static async seksi(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await masterService.getSeksi();
            res.status(200).json({
                success: true,
                message: 'Daftar seksi/bidang berhasil dimuat',
                data
            });
        } catch (error) { next(error); }
    }

    static async employees(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await masterService.getEmployees();
            res.status(200).json({
                success: true,
                message: 'Daftar pegawai aktif berhasil dimuat',
                data
            });
        } catch (error) { next(error); }
    }
}
