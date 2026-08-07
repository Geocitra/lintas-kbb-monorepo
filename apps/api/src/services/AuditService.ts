// apps/api/src/services/AuditService.ts
import prisma from '../config/database';

export class AuditService {

    /**
     * Menarik data histori aset dengan sistem Paginasi
     * Bisa difilter berdasarkan spesifik ID Aset jika diperlukan
     */
    async getHistories(page: number = 1, limit: number = 10, assetId?: string) {
        const skip = (page - 1) * limit;

        // Filter dinamis
        const whereCondition = assetId ? { asset_id: assetId } : {};

        const [histories, total] = await Promise.all([
            prisma.assetHistory.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    actor: {
                        select: { name: true, role: true, nip: true }
                    },
                    asset: {
                        select: { nama_aset: true, kode_inventaris: true, kategori: { select: { nama: true } } }
                    }
                }
            }),
            prisma.assetHistory.count({ where: whereCondition })
        ]);

        return { histories, total };
    }
}