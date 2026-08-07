// apps/api/prisma/seed-users.ts
// Jalankan dengan: npx tsx prisma/seed-users.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Dishub@2026';

async function main() {
    console.log('🌱 [SEEDER] Membuat akun demo untuk semua role...\n');

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    const users = [
        {
            name: 'Kepala Dinas Perhubungan',
            email: 'kadis@dishub-kbb.go.id',
            nip: '197001011990031001',
            role: 'KADIS' as const,
            no_wa: '6281234567890',
        },
        {
            name: 'Admin Sistem LINTAS',
            email: 'admin@dishub-kbb.go.id',
            nip: '198505152010011002',
            role: 'ADMIN' as const,
            no_wa: '6281234567891',
        },
        {
            name: 'Kepala Seksi Jalan',
            email: 'kasi@dishub-kbb.go.id',
            nip: '199002202015041003',
            role: 'KASI' as const,
            no_wa: '6281234567892',
        },
        {
            name: 'Budi Teknisi Lapangan',
            email: 'teknisi@dishub-kbb.go.id',
            nip: '199510052018011004',
            role: 'TEKNISI' as const,
            no_wa: '6281234567893',
        },
        {
            name: 'Warga Demo',
            email: 'warga@gmail.com',
            nip: null,
            role: 'MASYARAKAT' as const,
            no_wa: '6281234567894',
        },
    ];

    for (const user of users) {
        const created = await prisma.user.upsert({
            where: { email: user.email },
            update: { password: passwordHash }, // Update password jika sudah ada
            create: {
                name: user.name,
                email: user.email,
                nip: user.nip,
                role: user.role,
                no_wa: user.no_wa,
                password: passwordHash,
            },
        });
        console.log(`✅ [${created.role.padEnd(12)}] ${created.name} — ${created.email}`);
    }

    console.log(`\n🔑 Password semua akun: ${DEFAULT_PASSWORD}`);
    console.log('📝 Login bisa menggunakan EMAIL atau NIP sebagai identifier.\n');
}

main()
    .catch((e) => {
        console.error('❌ Gagal seed users:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
