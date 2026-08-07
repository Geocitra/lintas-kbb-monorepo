// packages/types/src/schemas/user.schema.ts
import { z } from 'zod';

// ==========================================
// 1. ENUMERASI DOMAIN USER
// ==========================================
export const RoleEnum = z.enum(['KADIS', 'ADMIN', 'KASI', 'TEKNISI', 'MASYARAKAT']);

// ==========================================
// 2. SCHEMAS (DATA CONTRACTS)
// ==========================================

export const UserLoginSchema = z.object({
    // Menggunakan 'identifier' agar Klien bisa login pakai NIP atau Email
    identifier: z.string().min(3, 'NIP atau Email wajib diisi'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const CreateUserSchema = z.object({
    name: z.string().min(3, 'Nama lengkap wajib diisi'),
    nip: z.string().min(5, 'NIP wajib diisi').optional().nullable(),
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(8, 'Keamanan: Password minimal 8 karakter'),

    // Memaksa format nomor WA seragam (Socio-Engineering: Mencegah spasi atau 08)
    no_wa: z.string()
        .regex(/^62\d{8,13}$/, 'Nomor WA harus diawali 62 dan berisi 10-15 digit')
        .optional()
        .nullable(),

    role: RoleEnum.default('TEKNISI'),

    // Jika role = TEKNISI/KASI, seksi_id wajib valid CUID
    seksi_id: z.string().cuid('Seksi ID tidak valid').optional().nullable(),
});

export const UpdateUserSchema = CreateUserSchema.partial().extend({
    // Password opsional saat update, tapi jika diisi minimal 8 karakter
    password: z.string().min(8).optional().nullable()
});

// ==========================================
// 3. TYPESCRIPT INFERENCES
// ==========================================
export type Role = z.infer<typeof RoleEnum>;
export type UserLoginDTO = z.infer<typeof UserLoginSchema>;
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;