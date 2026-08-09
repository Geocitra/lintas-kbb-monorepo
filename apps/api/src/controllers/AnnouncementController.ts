// apps/api/src/controllers/AnnouncementController.ts
import { Request, Response, NextFunction } from 'express';
import { AnnouncementService } from '../services/AnnouncementService';
import { CreateAnnouncementSchema } from '@dishub/types';

const announcementService = new AnnouncementService();

export class AnnouncementController {

    // POST /api/v1/announcements (Khusus Admin/Kadis)
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const validData = CreateAnnouncementSchema.parse(req.body);
            const authorId = req.user!.id;

            const announcement = await announcementService.createAnnouncement(validData, authorId);

            res.status(201).json({
                success: true,
                message: 'Pengumuman berhasil disiarkan',
                data: announcement
            });
        } catch (error) { next(error); }
    }

    // GET /api/v1/announcements/urgent (Semua Role — untuk NotificationBell)
    static async getUrgent(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const userRole = req.user!.role;

            const unread = await announcementService.getUnreadAnnouncements(userId, userRole);

            res.status(200).json({
                success: true,
                message: 'Daftar notifikasi pengumuman belum dibaca',
                data: unread
            });
        } catch (error) { next(error); }
    }

    // POST /api/v1/announcements/:id/ack (Semua Role)
    static async acknowledge(req: Request, res: Response, next: NextFunction) {
        try {
            const announcementId = req.params.id as string;
            const userId = req.user!.id;

            await announcementService.acknowledgeAnnouncement(announcementId, userId);

            res.status(200).json({
                success: true,
                message: 'Tanda terima (Read Receipt) berhasil dicatat sistem.'
            });
        } catch (error) { next(error); }
    }

    // GET /api/v1/announcements (Semua Role)
    static async index(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const userRole = req.user!.role;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const { announcements, total } = await announcementService.getAllAnnouncements(userId, userRole, page, limit);

            // Mapping response agar Frontend mudah mengecek status read
            const formattedData = announcements.map(ann => ({
                ...ann,
                is_read: ann.acknowledgments.length > 0, // boolean true jika sudah dibaca
                acknowledgments: undefined // buang array aslinya agar response bersih
            }));

            res.status(200).json({
                success: true,
                message: 'Daftar pengumuman berhasil dimuat',
                data: formattedData,
                meta: { page, limit, total_data: total, total_pages: Math.ceil(total / limit) }
            });
        } catch (error) { next(error); }
    }
}