// apps/api/src/controllers/AuditController.ts
import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/AuditService';

const auditService = new AuditService();

export class AuditController {

    static async index(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const assetId = req.query.asset_id as string; // Opsional

            const { histories, total } = await auditService.getHistories(page, limit, assetId);

            res.status(200).json({
                success: true,
                message: 'Data Audit Trail (Jejak Rekam) berhasil dimuat',
                data: histories,
                meta: {
                    page,
                    limit,
                    total_data: total,
                    total_pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }
}