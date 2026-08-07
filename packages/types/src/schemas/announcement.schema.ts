// packages/types/src/schemas/announcement.schema.ts
import { z } from 'zod';

// ==========================================
// 1. ENUMERASI DOMAIN PENGUMUMAN
// ==========================================
export const AnnouncementTargetEnum = z.enum(['SEMUA', 'TEKNISI', 'KASI', 'ADMIN']);

// ==========================================
// 2. SCHEMAS (DATA CONTRACTS)
// ==========================================

// Skema untuk Admin/Kadis saat membuat Pengumuman Baru
export const CreateAnnouncementSchema = z.object({
    title: z.string().min(5, { message: 'Judul pengumuman minimal 5 karakter' }),
    content: z.string().min(10, { message: 'Isi pengumuman minimal 10 karakter agar informatif' }),

    target: AnnouncementTargetEnum.default('SEMUA'),

    // Socio-Engineering: Jika TRUE, Frontend akan mengunci layar (Pop-Up Wajib Baca)
    is_important: z.boolean().default(false),

    // Kapan pengumuman ini berhenti ditampilkan (Opsional)
    expires_at: z.coerce.date().optional().nullable(),
});

// ==========================================
// 3. TYPESCRIPT INFERENCES
// ==========================================
export type AnnouncementTarget = z.infer<typeof AnnouncementTargetEnum>;
export type CreateAnnouncementDTO = z.infer<typeof CreateAnnouncementSchema>;