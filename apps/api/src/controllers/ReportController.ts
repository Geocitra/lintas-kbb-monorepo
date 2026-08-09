import { Request, Response, NextFunction } from 'express';
import { CreatePublicReportSchema } from '@dishub/types';
import { ReportService } from '../services/ReportService';

const reportService = new ReportService();

export class ReportController {
    static async submitPublicReport(req: Request, res: Response, next: NextFunction) {
        try {
            const validData = CreatePublicReportSchema.parse(req.body);

            // HANYA 1 BARIS INI! Controller tidak peduli urusan PostGIS.
            const { report, isSpam } = await reportService.processPublicReport(validData);

            res.status(201).json({
                success: true,
                message: isSpam
                    ? 'Laporan diterima. Namun sistem mendeteksi ketidaksesuaian lokasi GPS dengan aset. Laporan akan ditinjau lebih ketat oleh Admin.'
                    : 'Laporan berhasil dikirim. Aset terkait telah ditandai untuk perbaikan segera!',
                data: { ticket_number: report.ticket_number, is_spam: isSpam }
            });
        } catch (error) { next(error); }
    }
    static async index(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const isValid = req.query.is_valid !== undefined 
                ? req.query.is_valid === 'true'
                : undefined;

            const user = (req as any).user;
            const seksiId = user?.role === 'KASI' ? user?.seksi_id : undefined;

            const { reports, total } = await reportService.getAllReports(page, limit, isValid, seksiId);

            res.status(200).json({
                success: true,
                message: 'Daftar laporan berhasil dimuat',
                data: reports,
                meta: { page, limit, total_data: total, total_pages: Math.ceil(total / limit) }
            });
        } catch (error) { next(error); }
    }
    static async trackPublicReport(req: Request, res: Response, next: NextFunction) {
        try {
            const ticketNumber = req.params.ticket_number as string;
            const status = await reportService.getPublicReportStatus(ticketNumber);

            res.status(200).json({
                success: true,
                message: 'Informasi status pelacakan laporan berhasil dimuat.',
                data: status
            });
        } catch (error) { next(error); }
    }
}