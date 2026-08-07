// apps/api/src/controllers/AssignmentController.ts
import { Request, Response, NextFunction } from 'express';
import { AssignmentService } from '../services/AssignmentService';
import { AssignAssetSchema } from '@dishub/types';
import { z } from 'zod';

const assignmentService = new AssignmentService();

export class AssignmentController {

    // ==========================================
    // USE CASE 2.3: SERAH TERIMA ASET BERGERAK
    // ==========================================
    static async assignToUser(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. Zod Validasi
            const validData = AssignAssetSchema.parse(req.body);

            // 2. Aktor yang melakukan assign (Harus Admin)
            const adminId = req.user!.id;

            // 3. Eksekusi Handover
            const assignment = await assignmentService.assignAssetToUser(validData, adminId);

            res.status(201).json({
                success: true,
                message: 'Serah terima aset berhasil diproses dan dicatat dalam Audit Trail.',
                data: assignment
            });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // USE CASE: PENGEMBALIAN ASET KE GUDANG
    // ==========================================
    static async returnToGudang(req: Request, res: Response, next: NextFunction) {
        try {
            const assetId = req.params.asset_id as string;

            // Validasi input khusus kondisi akhir (Inline Zod Validation)
            const ReturnSchema = z.object({
                kondisi_akhir: z.string().min(3, 'Tuliskan kondisi aset saat dikembalikan')
            });
            const { kondisi_akhir } = ReturnSchema.parse(req.body);

            const adminId = req.user!.id;

            const result = await assignmentService.returnAssetToGudang(assetId, adminId, kondisi_akhir);

            res.status(200).json({
                success: true,
                message: 'Aset berhasil dikembalikan dan status diperbarui menjadi GUDANG.',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}