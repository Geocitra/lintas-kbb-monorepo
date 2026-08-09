// apps/api/src/services/AssignmentService.ts
import prisma from '../config/database';
import { AssignAssetDTO } from '@dishub/types';
import { AppError } from '../middlewares/errorHandler';

export class AssignmentService {

    /**
     * USE CASE 2.3: SERAH TERIMA ASET BERGERAK (HANDOVER)
     * Mencegah Fraud dan memastikan aset ditelusuri dengan jelas.
     */
    async assignAssetToUser(data: AssignAssetDTO, adminId: string) {

        // 1. Cek Ketersediaan dan Kondisi Aset
        const asset = await prisma.asset.findUnique({
            where: { id: data.asset_id },
            include: { kategori: true }
        });

        if (!asset) {
            throw new AppError('Aset tidak ditemukan dalam sistem.', 404);
        }

        // --- SOCIO-ENGINEERING GUARD (Business Rules) ---

        // RULE A: Aset Spasial tidak boleh diserahterimakan ke perorangan
        if (asset.kategori.is_spatial) {
            throw new AppError('Pelanggaran Prosedur: Aset spasial/infrastruktur (seperti PJU atau Rambu) tidak dapat diserahterimakan sebagai inventaris perorangan.', 403);
        }

        // RULE B: Aset Rusak tidak boleh dipindahtangankan
        if (['RUSAK_RINGAN', 'RUSAK_BERAT', 'KRITIS', 'HILANG'].includes(asset.kondisi)) {
            throw new AppError(`Aset sedang dalam kondisi ${asset.kondisi}. Aset harus masuk ke bengkel perbaikan, tidak boleh diserahterimakan ke pegawai baru.`, 403);
        }

        // RULE C: Aset yang sedang diperbaiki tidak bisa di-assign
        if (asset.status_operasional === 'DALAM_PERBAIKAN' || asset.status_operasional === 'AFKIR') {
            throw new AppError('Aset sedang dalam perbaikan atau sudah diafkirkan.', 403);
        }

        // 2. Eksekusi Handover dalam Transaction (ACID)
        return await prisma.$transaction(async (tx) => {

            // A. Cari penanggung jawab (PIC) sebelumnya yang belum mengembalikan aset
            const currentAssignment = await tx.assetAssignment.findFirst({
                where: {
                    asset_id: data.asset_id,
                    returned_at: null // Mencari yang masih berstatus 'Dipinjam'
                }
            });

            // B. Jika ada PIC lama, tutup catatannya (Kembalikan ke Gudang secara logikal)
            if (currentAssignment) {
                await tx.assetAssignment.update({
                    where: { id: currentAssignment.id },
                    data: {
                        returned_at: new Date(),
                        kondisi_dikembalikan: data.kondisi_serah_terima, // Asumsi kondisi lama sesuai saat serah terima baru
                    }
                });
            }

            // C. Buat Penugasan / Serah Terima Baru
            const newAssignment = await tx.assetAssignment.create({
                data: {
                    asset_id: data.asset_id,
                    user_id: data.user_id,
                    assigned_by_id: adminId,
                    kondisi_serah_terima: data.kondisi_serah_terima,
                    foto_bukti: data.foto_bukti,
                }
            });

            // D. Update Status Aset menjadi AKTIF (Jika sebelumnya GUDANG)
            await tx.asset.update({
                where: { id: data.asset_id },
                data: { status_operasional: 'AKTIF' }
            });

            // E. Catat di Audit Trail (Sejarah Pemakaian)
            await tx.assetHistory.create({
                data: {
                    asset_id: data.asset_id,
                    actor_id: adminId,
                    action: 'SERAH_TERIMA',
                    new_data: { user_id: data.user_id, assignment_id: newAssignment.id },
                    keterangan: `Diserahterimakan ke Pegawai. Kondisi fisik: ${data.kondisi_serah_terima}`,
                }
            });

            return newAssignment;
        });
    }

    /**
     * USE CASE Tambahan: MENGEMBALIKAN ASET (Return)
     */
    async returnAssetToGudang(assetId: string, adminId: string, kondisi_akhir: string) {
        return await prisma.$transaction(async (tx) => {

            const activeAssignment = await tx.assetAssignment.findFirst({
                where: { asset_id: assetId, returned_at: null }
            });

            if (!activeAssignment) {
                throw new AppError('Aset ini tidak sedang dipinjam oleh siapapun (Sudah di Gudang).', 400);
            }

            // 1. Tutup Assignment
            const returned = await tx.assetAssignment.update({
                where: { id: activeAssignment.id },
                data: {
                    returned_at: new Date(),
                    kondisi_dikembalikan: kondisi_akhir
                }
            });

            // 2. Kembalikan status aset ke GUDANG
            await tx.asset.update({
                where: { id: assetId },
                data: { status_operasional: 'GUDANG' }
            });

            // 3. Catat di Audit
            await tx.assetHistory.create({
                data: {
                    asset_id: assetId,
                    actor_id: adminId,
                    action: 'PENGEMBALIAN_ASET',
                    keterangan: `Aset dikembalikan ke Gudang. Kondisi akhir: ${kondisi_akhir}`,
                }
            });

            return returned;
        });
    }

    async getAssignments() {
        return await prisma.assetAssignment.findMany({
            include: {
                asset: {
                    select: {
                        id: true,
                        nama_aset: true,
                        kode_inventaris: true,
                    }
                },
                user: { select: { id: true, name: true, nip: true } },
                assignor: { select: { id: true, name: true } }
            },
            orderBy: { assigned_at: 'desc' }
        });
    }
}