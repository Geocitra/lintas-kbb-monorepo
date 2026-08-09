// apps/api/src/services/AnnouncementService.ts
import prisma from '../config/database';
import { CreateAnnouncementDTO } from '@dishub/types';
import { AppError } from '../middlewares/errorHandler';

export class AnnouncementService {

    /**
     * 1. MEMBUAT PENGUMUMAN (KADIS/ADMIN)
     */
    async createAnnouncement(data: CreateAnnouncementDTO, authorId: string) {
        return await prisma.announcement.create({
            data: {
                title: data.title,
                content: data.content,
                target: data.target as any,
                is_important: data.is_important,
                expires_at: data.expires_at,
                author_id: authorId,
            }
        });
    }

    /**
     * 2. NOTIFIKASI: MENCARI PENGUMUMAN YANG BELUM DIBACA
     * Digunakan oleh NotificationBell di topbar untuk menampilkan badge count
     */
    async getUnreadAnnouncements(userId: string, userRole: string) {
        // Mapping Role User ke Target Pengumuman
        const allowedTargets = ['SEMUA'];
        if (['TEKNISI', 'KASI', 'ADMIN'].includes(userRole)) {
            allowedTargets.push(userRole);
        }

        const unreadAnnouncements = await prisma.announcement.findMany({
            where: {
                target: { in: allowedTargets as any[] },
                // Pastikan belum expired (jika ada expires_at)
                OR: [
                    { expires_at: null },
                    { expires_at: { gt: new Date() } }
                ],
                // Hanya cari yang "ID User ini TIDAK ADA di tabel Acknowledgment"
                acknowledgments: {
                    none: { user_id: userId }
                }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { name: true, role: true } }
            }
        });

        return unreadAnnouncements;
    }

    /**
     * 3. READ RECEIPT: MENCATAT "SAYA MENGERTI"
     */
    async acknowledgeAnnouncement(announcementId: string, userId: string) {
        const announcement = await prisma.announcement.findUnique({
            where: { id: announcementId }
        });

        if (!announcement) throw new AppError('Pengumuman tidak ditemukan', 404);

        // Upsert agar jika ada klik ganda dari frontend tidak menyebabkan error Database
        return await prisma.announcementAck.upsert({
            where: {
                announcement_id_user_id: {
                    announcement_id: announcementId,
                    user_id: userId
                }
            },
            update: {}, // Jika sudah ada, biarkan saja
            create: {
                announcement_id: announcementId,
                user_id: userId
            }
        });
    }

    /**
     * 4. DAFTAR SEMUA PENGUMUMAN (FEED)
     */
    async getAllAnnouncements(userId: string, userRole: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const allowedTargets = ['SEMUA'];
        if (['TEKNISI', 'KASI', 'ADMIN'].includes(userRole)) {
            allowedTargets.push(userRole);
        }

        const [announcements, total] = await Promise.all([
            prisma.announcement.findMany({
                where: { target: { in: allowedTargets as any[] } },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: { select: { name: true, role: true } },
                    // Cek apakah user ini sudah membaca pengumuman ini (untuk indikator UI "New/Read")
                    acknowledgments: {
                        where: { user_id: userId },
                        select: { read_at: true }
                    }
                }
            }),
            prisma.announcement.count({
                where: { target: { in: allowedTargets as any[] } }
            })
        ]);

        return { announcements, total };
    }
}