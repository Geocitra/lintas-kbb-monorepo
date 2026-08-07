// packages/types/src/schemas/asset.schema.ts
import { z } from 'zod';

// ==========================================
// 1. ENUMERASI DOMAIN ASET
// ==========================================
export const AssetConditionEnum = z.enum(['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'KRITIS', 'HILANG']);
export const AssetStateEnum = z.enum(['DRAFT', 'GUDANG', 'AKTIF', 'DALAM_PERBAIKAN', 'AFKIR']);

// ==========================================
// 2. SCHEMAS (DATA CONTRACTS)
// ==========================================

// A. Skema Dasar (General)
export const CreateAssetSchema = z.object({
    kategori_id: z.string().cuid('Kategori ID tidak valid'),
    kode_inventaris: z.string().optional().nullable(),
    nama_aset: z.string().min(3, 'Nama aset minimal 3 karakter'),
    kondisi: AssetConditionEnum.default('BAIK'),
    status_operasional: AssetStateEnum.default('DRAFT'),
    lat: z.number().min(-90).max(90).optional().nullable(),
    lng: z.number().min(-180).max(180).optional().nullable(),
    alamat_fisik: z.string().optional().nullable(),
    metadata: z.record(z.string(), z.any()).default({}),
    // UPDATE FASE 6: URL dihapus agar menerima local path dari Multer
    foto_utama: z.string().optional().nullable(),
});

export const UpdateAssetSchema = CreateAssetSchema.partial();

// B. Skema Pengadaan Massal (Top-Down)
export const ProcurementItemSchema = z.object({
    kategori_id: z.string().cuid('Kategori ID wajib'),
    kode_inventaris: z.string().min(3, 'Kode inventaris wajib untuk barang baru'),
    nama_aset: z.string().min(3),
    metadata: z.record(z.string(), z.any()).default({}),
});

export const BulkProcurementSchema = z.object({
    assets: z.array(ProcurementItemSchema).min(1, 'Minimal harus ada 1 aset untuk pengadaan'),
});

// C. Skema Sensus Lapangan (Bottom-Up)
export const FieldDraftSchema = z.object({
    kategori_id: z.string().cuid('Kategori ID wajib dipilih'),
    nama_aset: z.string().min(3),
    kondisi: AssetConditionEnum.default('BAIK'),
    lat: z.number({ message: 'Koordinat Latitude wajib dikunci' }).min(-90).max(90),
    lng: z.number({ message: 'Koordinat Longitude wajib dikunci' }).min(-180).max(180),
    alamat_fisik: z.string().min(5, 'Alamat atau deskripsi lokasi wajib diisi'),
    // UPDATE FASE 6: Diubah menjadi string biasa tapi minimal 1 karakter (Wajib ada)
    foto_utama: z.string().min(1, 'Foto bukti sensus wajib diunggah'),
    metadata: z.record(z.string(), z.any()).default({}),
});

// D. Skema Serah Terima Aset (Handover)
export const AssignAssetSchema = z.object({
    asset_id: z.string().cuid('Aset ID tidak valid'),
    user_id: z.string().cuid('ID Pegawai penerima tidak valid'),
    kondisi_serah_terima: z.string().min(5, 'Catatan kondisi saat penyerahan wajib diisi'),
    // UPDATE FASE 6: URL dihapus untuk mengakomodir local path
    foto_bukti: z.string().optional().nullable(),
});

// ==========================================
// 3. TYPESCRIPT INFERENCES
// ==========================================
export type AssetCondition = z.infer<typeof AssetConditionEnum>;
export type AssetState = z.infer<typeof AssetStateEnum>;

export type CreateAssetDTO = z.infer<typeof CreateAssetSchema>;
export type UpdateAssetDTO = z.infer<typeof UpdateAssetSchema>;
export type BulkProcurementDTO = z.infer<typeof BulkProcurementSchema>;
export type FieldDraftDTO = z.infer<typeof FieldDraftSchema>;
export type AssignAssetDTO = z.infer<typeof AssignAssetSchema>;