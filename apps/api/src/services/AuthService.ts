// apps/api/src/services/AuthService.ts
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserLoginDTO } from '@dishub/types';
import { AppError } from '../middlewares/errorHandler';

export class AuthService {

    /**
     * USE CASE: LOGIN (Otentikasi Stateless)
     */
    async login(data: UserLoginDTO) {
        // 1. Fleksibilitas: Cari user berdasarkan Email ATAU NIP
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.identifier },
                    { nip: data.identifier }
                ]
            },
            include: { seksi: true } // Ambil sekalian nama bidang/seksi-nya
        });

        // 2. Cegah Enumeration Attack: Pesan error harus ambigu jika user tidak ada
        if (!user) {
            throw new AppError('Kredensial tidak valid. NIP/Email atau Password salah.', 401);
        }

        // 3. Socio-Engineering Guard: Pemecatan / Penonaktifan Akun
        if (!user.is_active) {
            throw new AppError('Akun Anda telah dinonaktifkan. Silakan hubungi Administrator.', 403);
        }

        // 4. Verifikasi Password Kriptografi (Bcrypt)
        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Kredensial tidak valid. NIP/Email atau Password salah.', 401);
        }

        // 5. Generasi Payload JSON Web Token (Hanya simpan data tidak sensitif)
        const payload = {
            id: user.id,
            role: user.role,
            seksi_id: user.seksi_id
        };

        const secret = process.env.JWT_SECRET || 'D1shubKBB_S3cur3_T0k3n_G3nerat0r_2026!#@';
        const expiresIn = process.env.JWT_EXPIRES_IN || '12h'; // Sesi berakhir dalam 12 jam kerja

        const token = jwt.sign(payload, secret, { expiresIn: expiresIn as any });

        // 6. Keamanan Data: Buang password dari object sebelum dikirim ke Frontend
        const { password, ...userWithoutPassword } = user;

        return {
            token,
            user: userWithoutPassword
        };
    }

    /**
     * USE CASE: HYDRATE SESSION (Untuk React Frontend)
     * Saat user me-refresh browser, React butuh data user terbaru tanpa login ulang.
     */
    async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nip: true,
                name: true,
                email: true,
                no_wa: true,
                role: true,
                is_active: true,
                seksi: { select: { id: true, nama_seksi: true } }
            }
        });

        if (!user) throw new AppError('Data Pengguna tidak ditemukan', 404);
        if (!user.is_active) throw new AppError('Akun dinonaktifkan', 403);

        return user;
    }
}