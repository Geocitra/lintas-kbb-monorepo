// apps/api/src/services/MasterService.ts
import prisma from '../config/database';

export class MasterService {
    async getCategories() {
        return await prisma.category.findMany({
            orderBy: { nama: 'asc' }
        });
    }

    async getSeksi() {
        return await prisma.seksi.findMany({
            orderBy: { nama_seksi: 'asc' }
        });
    }

    async getEmployees() {
        return await prisma.user.findMany({
            where: { is_active: true },
            select: {
                id: true,
                name: true,
                nip: true,
                role: true,
                seksi: {
                    select: {
                        id: true,
                        nama_seksi: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }
}
