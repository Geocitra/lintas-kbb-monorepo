// apps/api/src/controllers/AssetController.ts
import { Request, Response, NextFunction } from 'express';
import { AssetService } from '../services/AssetService';
import { CreateAssetSchema, BulkProcurementSchema, FieldDraftSchema } from '@dishub/types';

const assetService = new AssetService();

export class AssetController {

    // ==========================================
    // FASE 2: PENGADAAN MASSAL (TOP-DOWN)
    // ==========================================
    static async bulkProcurement(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. Validasi Zod
            const validData = BulkProcurementSchema.parse(req.body);

            // 2. Ambil ID Admin dari JWT Middleware
            const adminId = req.user!.id;

            // 3. Panggil Information Expert
            const assets = await assetService.bulkCreateProcurement(validData, adminId);

            // 4. Return Success
            res.status(201).json({
                success: true,
                message: `${assets.length} Aset berhasil didaftarkan ke Gudang via Pengadaan.`,
                data: assets
            });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // FASE 2: SENSUS LAPANGAN (BOTTOM-UP)
    // ==========================================
    static async fieldCensus(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. Validasi Zod (Memastikan GPS dan Foto ada)
            const validData = FieldDraftSchema.parse(req.body);

            // 2. Ambil ID Teknisi dari JWT
            const technicianId = req.user!.id;

            // 3. Panggil Service
            const draftAsset = await assetService.createDraftFromField(validData, technicianId);

            res.status(201).json({
                success: true,
                message: 'Data sensus berhasil disimpan sebagai DRAFT. Menunggu validasi Admin.',
                data: draftAsset
            });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // METODE STANDAR (CRUD Lama)
    // ==========================================
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const validData = CreateAssetSchema.parse(req.body);
            const asset = await assetService.createAsset(validData);
            res.status(201).json({ success: true, message: 'Aset berhasil didaftarkan', data: asset });
        } catch (error) { next(error); }
    }

    static async index(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const { assets, total } = await assetService.getAllAssets(page, limit);

            res.status(200).json({
                success: true,
                message: 'Data aset berhasil dimuat',
                data: assets,
                meta: { page, limit, total_data: total, total_pages: Math.ceil(total / limit) }
            });
        } catch (error) { next(error); }
    }

    static async show(req: Request, res: Response, next: NextFunction) {
        try {
            const asset = await assetService.getAssetById(req.params.id as string);
            res.status(200).json({ success: true, message: 'Detail aset dimuat', data: asset });
        } catch (error) { next(error); }
    }

    static async destroy(req: Request, res: Response, next: NextFunction) {
        try {
            await assetService.deleteAsset(req.params.id as string);
            res.status(200).json({ success: true, message: 'Aset berhasil diafkirkan / dihapus' });
        } catch (error) { next(error); }
    }
}