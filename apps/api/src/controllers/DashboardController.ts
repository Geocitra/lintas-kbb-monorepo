// apps/api/src/controllers/DashboardController.ts
import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/DashboardService';
import { ExportGenerator } from '../utils/ExportGenerator';

const dashboardService = new DashboardService();

export class DashboardController {

    // Endpoint: GET /api/v1/dashboard/stats
    static async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await dashboardService.getExecutiveStats();

            res.status(200).json({
                success: true,
                message: 'Data statistik dashboard berhasil dimuat',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    // Endpoint: GET /api/v1/dashboard/export/excel
    static async exportExcel(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. Ambil data dari Service
            const data = await dashboardService.getExportData();

            // 2. Panggil Pabrik Dokumen (Tidak perlu res.json karena ini Stream)
            await ExportGenerator.generateExcel(res, data);

        } catch (error) {
            // Jika terjadi error sebelum stream dimulai, kita kembalikan JSON
            if (!res.headersSent) {
                next(error);
            } else {
                console.error('Stream error:', error);
            }
        }
    }

    // Endpoint: GET /api/v1/dashboard/export/pdf
    static async exportPdf(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await dashboardService.getExportData();

            // Panggil Pabrik PDF
            ExportGenerator.generatePDF(res, data);

        } catch (error) {
            if (!res.headersSent) {
                next(error);
            } else {
                console.error('PDF Stream error:', error);
            }
        }
    }
}