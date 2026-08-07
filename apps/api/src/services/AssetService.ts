// apps/api/src/services/AssetService.ts
import prisma from '../config/database';
import { CreateAssetDTO, UpdateAssetDTO, BulkProcurementDTO, FieldDraftDTO } from '@dishub/types';
import { AppError } from '../middlewares/errorHandler';

export class AssetService {

    // Create Asset + Integrasi Geometry PostGIS (Fase 1)
    async createAsset(data: CreateAssetDTO) {
        // 1. Buat data administratif di Prisma
        const newAsset = await prisma.asset.create({
            data: {
                kategori_id: data.kategori_id,
                kode_inventaris: data.kode_inventaris,
                nama_aset: data.nama_aset,
                kondisi: data.kondisi,
                status_operasional: data.status_operasional,
                lat: data.lat,
                lng: data.lng,
                alamat_fisik: data.alamat_fisik,
                metadata: data.metadata ?? {},
                foto_utama: data.foto_utama,
            },
        });

        // 2. Transaksi PostGIS: Update kolom geometri jika lat/lng tersedia (Khusus Spasial)
        if (data.lat && data.lng) {
            await prisma.$executeRaw`
        UPDATE "Asset" 
        SET geom = ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326) 
        WHERE id = ${newAsset.id}
      `;
        }

        return newAsset;
    }

    // Get All dengan Pagination (Bisa difilter) (Fase 1)
    async getAllAssets(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [assets, total] = await Promise.all([
            prisma.asset.findMany({
                skip,
                take: limit,
                include: { kategori: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.asset.count()
        ]);

        return { assets, total };
    }

    // Get Single Asset by ID (Fase 1)
    async getAssetById(id: string) {
        const asset = await prisma.asset.findUnique({
            where: { id },
            include: {
                kategori: true,
                assignments: { include: { user: { select: { name: true, nip: true } } } } // Ambil info PIC
            }
        });

        if (!asset) throw new AppError('Data aset tidak ditemukan', 404);
        return asset;
    }

    // Soft Delete atau Ganti Status ke AFKIR (Fase 1)
    async deleteAsset(id: string) {
        const asset = await this.getAssetById(id);

        // Socio-Engineering: Kita tidak menghapus baris di DB untuk alasan Audit. Kita ubah state-nya.
        const deletedAsset = await prisma.asset.update({
            where: { id: asset.id },
            data: { status_operasional: 'AFKIR' }
        });

        return deletedAsset;
    }

    /**
     * USE CASE 2.1: PENGADAAN MASAL (TOP-DOWN)
     * Aktor: Admin/Kadis. Aset masuk ke Gudang. 
     * Transaksional: Jika 1 gagal, semua gagal (ACID).
     */
    async bulkCreateProcurement(data: BulkProcurementDTO, adminId: string) {
        // Jalankan dalam $transaction agar atomik
        return await prisma.$transaction(async (tx) => {
            const createdAssets = [];

            for (const item of data.assets) {
                // 1. Buat Aset dengan State = GUDANG, Kondisi = BAIK
                const newAsset = await tx.asset.create({
                    data: {
                        kategori_id: item.kategori_id,
                        kode_inventaris: item.kode_inventaris,
                        nama_aset: item.nama_aset,
                        kondisi: 'BAIK',
                        status_operasional: 'GUDANG', // Out-of-the-box rule
                        metadata: item.metadata,
                    },
                });

                // 2. Buat Audit Trail (Log History)
                await tx.assetHistory.create({
                    data: {
                        asset_id: newAsset.id,
                        actor_id: adminId,
                        action: 'PENGADAAN_BARU',
                        new_data: newAsset as any,
                        keterangan: `Aset didaftarkan melalui proses pengadaan massal ke Gudang.`,
                    },
                });

                createdAssets.push(newAsset);
            }

            return createdAssets;
        });
    }

    /**
     * USE CASE 2.2: SENSUS LAPANGAN (BOTTOM-UP)
     * Aktor: Teknisi. Aset masuk mode Draft dan menyimpan Geometri PostGIS.
     */
    async createDraftFromField(data: FieldDraftDTO, technicianId: string) {
        // Jalankan dalam $transaction
        return await prisma.$transaction(async (tx) => {
            // 1. Simpan Data Dasar dengan State = DRAFT
            const draftAsset = await tx.asset.create({
                data: {
                    kategori_id: data.kategori_id,
                    nama_aset: data.nama_aset,
                    kondisi: data.kondisi,
                    status_operasional: 'DRAFT', // Mengunci state agar tidak langsung public
                    lat: data.lat,
                    lng: data.lng,
                    alamat_fisik: data.alamat_fisik,
                    foto_utama: data.foto_utama,
                    metadata: data.metadata,
                },
            });

            // 2. Injeksi Koordinat PostGIS (Anti-SQL Injection)
            await tx.$executeRaw`
        UPDATE "Asset" 
        SET geom = ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326) 
        WHERE id = ${draftAsset.id}
      `;

            // 3. Catat Audit Trail
            await tx.assetHistory.create({
                data: {
                    asset_id: draftAsset.id,
                    actor_id: technicianId,
                    action: 'SENSUS_LAPANGAN',
                    new_data: draftAsset as any,
                    keterangan: `Sensus lapangan oleh teknisi. Menunggu validasi admin. Koordinat: ${data.lat}, ${data.lng}`,
                },
            });

            return draftAsset;
        });
    }
}