// packages/types/src/schemas/report.schema.ts
import { z } from 'zod';

// ==========================================
// 1. ENUMERASI DOMAIN LAPORAN
// ==========================================
export const ReportSourceEnum = z.enum(['MASYARAKAT', 'INTERNAL']);

// SPAM akan digunakan oleh Admin / Sistem jika deteksi jarak GPS warga terlalu jauh (>50 meter)
export const ReportPriorityEnum = z.enum(['URGENT', 'TINGGI', 'NORMAL', 'RENDAH', 'SPAM']);

// ==========================================
// 2. SCHEMAS (DATA CONTRACTS)
// ==========================================

// A. Skema Laporan Warga Publik (Tanpa Auth)
export const CreatePublicReportSchema = z.object({
    nama_pelapor: z.string().min(3, { message: 'Nama pelapor wajib diisi minimal 3 karakter' }),
    kontak_pelapor: z.string().regex(/^62\d{8,13}$/, { message: 'Nomor WA harus diawali 62 dan berisi 10-15 digit' }),
    judul_laporan: z.string().min(5, { message: 'Judul laporan minimal 5 karakter' }),
    deskripsi: z.string().min(10, { message: 'Mohon jelaskan kondisi kerusakan dengan lebih detail (min 10 karakter)' }),
    lat: z.number({ message: 'Koordinat Latitude wajib dikirim' }).min(-90).max(90, { message: 'Latitude tidak valid' }),
    lng: z.number({ message: 'Koordinat Longitude wajib dikirim' }).min(-180).max(180, { message: 'Longitude tidak valid' }),

    // UPDATE FASE 6: Diubah menjadi string biasa namun wajib ada isinya
    foto_kejadian: z.string().min(1, { message: 'Bukti foto wajib dikirim' }),

    asset_id: z.string().cuid({ message: 'Format ID Aset tidak valid' }).optional().nullable(),
});

// B. Skema Laporan Internal (Petugas Lapangan)
// Socio-Engineering: Petugas diwajibkan memilih aset dari database
export const CreateInternalReportSchema = CreatePublicReportSchema.extend({
    asset_id: z.string().cuid({ message: 'Petugas lapangan WAJIB memilih aset yang dilaporkan dari sistem' }),
});

// C. Skema Validasi Laporan (Triage oleh Admin/Verifikator)
// Digunakan Admin untuk memutuskan apakah laporan ini valid untuk dijadikan Surat Perintah Kerja (SLA)
export const ValidateReportSchema = z.object({
    is_valid: z.boolean({ message: 'Pilih status validasi laporan (Ya/Tidak)' }),
    prioritas: ReportPriorityEnum.default('NORMAL'),

    // Opsional: Admin bisa mengkoreksi aset_id jika sistem / warga salah menandai aset
    asset_id: z.string().cuid().optional().nullable(),

    kepemilikan: z.enum(['DISHUB', 'UMUM']).default('DISHUB'),
    catatan_admin: z.string().min(5, { message: 'Berikan catatan analisis mengapa laporan ini di-approve / ditolak' }),
});

// ==========================================
// 3. TYPESCRIPT INFERENCES
// ==========================================
export type ReportSource = z.infer<typeof ReportSourceEnum>;
export type ReportPriority = z.infer<typeof ReportPriorityEnum>;

export type CreatePublicReportDTO = z.infer<typeof CreatePublicReportSchema>;
export type CreateInternalReportDTO = z.infer<typeof CreateInternalReportSchema>;
export type ValidateReportDTO = z.infer<typeof ValidateReportSchema>;