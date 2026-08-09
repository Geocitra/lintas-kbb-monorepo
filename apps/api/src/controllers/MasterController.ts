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
            res.status(200).json({ success: true, message: 'Daftar pegawai aktif berhasil dimuat', data });
        } catch (error) { next(error); }
    }

    // CRUD Kategori
    static async createCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await masterService.createCategory(req.body);
            res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan', data });
        } catch (error) { next(error); }
    }
    static async updateCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const data = await masterService.updateCategory(id, req.body);
            res.status(200).json({ success: true, message: 'Kategori berhasil diperbarui', data });
        } catch (error) { next(error); }
    }

    static async deleteCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            await masterService.deleteCategory(id);
            res.status(200).json({ success: true, message: 'Kategori berhasil dihapus' });
        } catch (error) { next(error); }
    }

    // CRUD Seksi
    static async createSeksi(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await masterService.createSeksi(req.body);
            res.status(201).json({ success: true, message: 'Seksi berhasil ditambahkan', data });
        } catch (error) { next(error); }
    }

    static async updateSeksi(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const data = await masterService.updateSeksi(id, req.body);
            res.status(200).json({ success: true, message: 'Seksi berhasil diperbarui', data });
        } catch (error) { next(error); }
    }

    static async deleteSeksi(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            await masterService.deleteSeksi(id);
            res.status(200).json({ success: true, message: 'Seksi berhasil dihapus' });
        } catch (error) { next(error); }
    }
}
