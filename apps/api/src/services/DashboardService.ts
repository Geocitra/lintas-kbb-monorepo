// apps/api/src/services/DashboardService.ts
import prisma from '../config/database';

export class DashboardService {

    /**
     * Mengumpulkan semua data agregasi untuk Chart di Dashboard Eksekutif
     */
    async getExecutiveStats() {
        // 1. Postur Total Aset
        const totalAssets = await prisma.asset.count();

        // 2. Distribusi Kondisi Aset (Group By)
        const conditionDistribution = await prisma.asset.groupBy({
            by: ['kondisi'],
            _count: { id: true }
        });

        // 3. Distribusi Kategori
        const categoryDistribution = await prisma.asset.groupBy({
            by: ['kategori_id'],
            _count: { id: true }
        });

        // Ambil nama kategori untuk melengkapi ID
        const categories = await prisma.category.findMany();
        const formattedCategoryDist = categoryDistribution.map(dist => {
            const cat = categories.find(c => c.id === dist.kategori_id);
            return {
                kategori: cat ? cat.nama : 'Unknown',
                total: dist._count.id
            };
        });

        // 4. Rasio Laporan Masyarakat vs Internal
        const reportRatio = await prisma.report.groupBy({
            by: ['sumber_pelapor'],
            _count: { id: true }
        });

        // 5. Aset Paling Kritis (Top 10)
        const criticalAssets = await prisma.asset.findMany({
            where: { kondisi: { in: ['KRITIS', 'HILANG'] } },
            include: { kategori: { select: { nama: true } } },
            orderBy: { updatedAt: 'desc' },
            take: 10
        });

        return {
            overview: {
                total_aset: totalAssets,
            },
            charts: {
                kondisi: conditionDistribution.map(item => ({ label: item.kondisi, value: item._count.id })),
                kategori: formattedCategoryDist,
                laporan: reportRatio.map(item => ({ label: item.sumber_pelapor, value: item._count.id }))
            },
            critical_assets: criticalAssets
        };
    }

    /**
     * Menarik data mentah untuk dieskpor ke PDF / Excel
     */
    async getExportData() {
        return await prisma.asset.findMany({
            include: {
                kategori: { select: { nama: true } }
            },
            orderBy: {
                kategori_id: 'asc'
            }
        });
    }
}