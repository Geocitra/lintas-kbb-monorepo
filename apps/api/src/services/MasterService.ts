// apps/api/src/services/MasterService.ts
import prisma from '../config/database';

export class MasterService {
    async getCategories() {
        return await prisma.category.findMany({
            include: { seksi: true },
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

    async createCategory(data: { nama: string; kode: string; is_spatial: boolean; seksi_id?: string | null }) {
        return await prisma.category.create({ data });
    }

    async updateCategory(id: string, data: { nama?: string; kode?: string; is_spatial?: boolean; seksi_id?: string | null }) {
        return await prisma.category.update({ where: { id }, data });
    }

    async deleteCategory(id: string) {
        return await prisma.category.delete({ where: { id } });
    }

    async createSeksi(data: { nama_seksi: string; deskripsi?: string }) {
        return await prisma.seksi.create({ data });
    }

    async updateSeksi(id: string, data: { nama_seksi?: string; deskripsi?: string }) {
        return await prisma.seksi.update({ where: { id }, data });
    }

    async deleteSeksi(id: string) {
        return await prisma.seksi.delete({ where: { id } });
    }
}
