// packages/types/src/schemas/ticket.schema.ts
import { z } from 'zod';

// ==========================================
// 1. ENUMERASI DOMAIN TICKET
// ==========================================
export const TicketPriorityEnum = z.enum(['URGENT', 'TINGGI', 'NORMAL', 'RENDAH']);

// Keputusan Admin saat me-review pekerjaan teknisi
export const ReviewDecisionEnum = z.enum(['APPROVE', 'REJECT']);

// ==========================================
// 2. SCHEMAS (DATA CONTRACTS)
// ==========================================

// A. Skema Penugasan oleh Admin (Assignment & SLA)
export const AssignTicketSchema = z.object({
    technician_id: z.string({ message: 'Teknisi wajib dipilih' }).cuid({ message: 'ID Teknisi tidak valid formatnya' }),
    prioritas: TicketPriorityEnum.default('NORMAL').optional(),
    instruksi_admin: z.string({ message: 'Instruksi wajib diberikan' }).min(10, { message: 'Berikan instruksi yang jelas kepada teknisi (min 10 karakter)' }),
    deadline_at: z.custom<Date>((val) => val instanceof Date || (typeof val === 'string' && !isNaN(Date.parse(val))), {
        message: 'Format tanggal/waktu SLA tidak valid'
    }).transform((val) => new Date(val)).refine((date) => date > new Date(), { message: 'Deadline tidak boleh berada di masa lalu!' })
});

// B. Skema Pengerjaan oleh Teknisi (Execution)
export const ExecuteTicketSchema = z.object({
    catatan_teknisi: z.string({ message: 'Catatan hasil perbaikan wajib diisi' })
        .min(10, { message: 'Jelaskan apa saja yang telah diperbaiki secara detail (min 10 karakter)' }),

    // UPDATE FASE 6: Diubah menjadi string biasa namun wajib ada isinya
    foto_hasil: z.string().min(1, { message: 'Foto hasil pekerjaan wajib disertakan' }),
    foto_tambahan: z.array(z.string()).max(5).optional(),
});

// C. Skema Review oleh Admin (Quality Control)
export const ReviewTicketSchema = z.object({
    keputusan: ReviewDecisionEnum,
    catatan_review: z.string({ message: 'Catatan review wajib diisi' })
        .min(5, { message: 'Berikan alasan mengapa pekerjaan ini disetujui atau ditolak' })
});

// ==========================================
// 3. TYPESCRIPT INFERENCES
// ==========================================
export type TicketPriority = z.infer<typeof TicketPriorityEnum>;
export type ReviewDecision = z.infer<typeof ReviewDecisionEnum>;

export type AssignTicketDTO = z.infer<typeof AssignTicketSchema>;
export type ExecuteTicketDTO = z.infer<typeof ExecuteTicketSchema>;
export type ReviewTicketDTO = z.infer<typeof ReviewTicketSchema>;