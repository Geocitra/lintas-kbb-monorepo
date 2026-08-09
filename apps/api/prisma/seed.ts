import { PrismaClient, Role, AssetCondition, AssetState, TicketStatus, AnnouncementTarget } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Dishub@2026';

async function main() {
    console.log('🌱 [SEEDER] Memulai proses Seeding Database Komprehensif...');

    // 1. Membersihkan data lama secara kaskade (Idempotent)
    console.log('🧹 [SEEDER] Mengosongkan data lama di semua tabel...');
    await prisma.$executeRaw`
        TRUNCATE TABLE 
            "RegionBoundary", 
            "AnnouncementAck", 
            "Announcement", 
            "MaintenanceTicket", 
            "Report", 
            "AssetAssignment", 
            "AssetHistory", 
            "Asset", 
            "User", 
            "Seksi", 
            "Category" 
        RESTART IDENTITY CASCADE;
    `;

    // 2. Hash password default
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    // ==========================================
    // SEEDING SEKSI
    // ==========================================
    console.log('📦 [SEEDER] Membuat data Seksi...');
    const seksiPju = await prisma.seksi.create({
        data: {
            nama_seksi: 'Seksi Penerangan Jalan Umum (PJU)',
            deskripsi: 'Bertanggung jawab atas pemeliharaan dan pengadaan penerangan jalan di seluruh KBB.',
        }
    });

    const seksiRambu = await prisma.seksi.create({
        data: {
            nama_seksi: 'Seksi Rambu & Marka Jalan',
            deskripsi: 'Mengelola rambu lalu lintas, marka jalan, cermin tikungan, dan pembatas jalan.',
        }
    });

    const seksiApill = await prisma.seksi.create({
        data: {
            nama_seksi: 'Seksi APILL & Fasilitas Lalu Lintas',
            deskripsi: 'Pemeliharaan Lampu Lalu Lintas (Traffic Light) dan rambu elektronik.',
        }
    });

    // ==========================================
    // SEEDING USER
    // ==========================================
    console.log('👥 [SEEDER] Membuat data Pengguna (Aktor)...');
    const kadis = await prisma.user.create({
        data: {
            name: 'H. Akhmad Dishub',
            email: 'kadis@dishub-kbb.go.id',
            nip: '197001011990031001',
            role: Role.KADIS,
            no_wa: '6281234567890',
            password: passwordHash,
        }
    });

    const admin = await prisma.user.create({
        data: {
            name: 'Admin Sistem LINTAS',
            email: 'admin@dishub-kbb.go.id',
            nip: '198505152010011002',
            role: Role.ADMIN,
            no_wa: '6281234567891',
            password: passwordHash,
        }
    });

    const kasi = await prisma.user.create({
        data: {
            name: 'Ir. Hendra (Kasi Rambu)',
            email: 'kasi@dishub-kbb.go.id',
            nip: '199002202015041003',
            role: Role.KASI,
            no_wa: '6281234567892',
            seksi_id: seksiRambu.id,
            password: passwordHash,
        }
    });

    const teknisiPju = await prisma.user.create({
        data: {
            name: 'Budi Santoso (Teknisi PJU)',
            email: 'teknisi@dishub-kbb.go.id',
            nip: '199510052018011004',
            role: Role.TEKNISI,
            no_wa: '6281234567893',
            seksi_id: seksiPju.id,
            password: passwordHash,
        }
    });

    const teknisiApill = await prisma.user.create({
        data: {
            name: 'Agus Ridwan (Teknisi APILL)',
            email: 'agus@dishub-kbb.go.id',
            nip: '199611062019021005',
            role: Role.TEKNISI,
            no_wa: '6281234567895',
            seksi_id: seksiApill.id,
            password: passwordHash,
        }
    });

    const warga1 = await prisma.user.create({
        data: {
            name: 'Warga Demo',
            email: 'warga@gmail.com',
            role: Role.MASYARAKAT,
            no_wa: '6281234567894',
            password: passwordHash,
        }
    });

    const warga2 = await prisma.user.create({
        data: {
            name: 'Warga Peduli KBB',
            email: 'peduli.kbb@gmail.com',
            role: Role.MASYARAKAT,
            no_wa: '6289999888776',
            password: passwordHash,
        }
    });

    // ==========================================
    // SEEDING CATEGORY
    // ==========================================
    console.log('🏷️ [SEEDER] Membuat data Kategori Aset...');
    const catPju = await prisma.category.create({
        data: { kode: 'PJU', nama: 'Penerangan Jalan Umum', is_spatial: true, seksi_id: seksiPju.id }
    });

    const catRambu = await prisma.category.create({
        data: { kode: 'RMB', nama: 'Rambu Lalu Lintas', is_spatial: true, seksi_id: seksiRambu.id }
    });

    const catApill = await prisma.category.create({
        data: { kode: 'APL', nama: 'Alat Pemberi Isyarat Lalu Lintas (APILL)', is_spatial: true, seksi_id: seksiApill.id }
    });

    const catKendaraan = await prisma.category.create({
        data: { kode: 'KND', nama: 'Kendaraan Operasional', is_spatial: false }
    });

    // ==========================================
    // SEEDING ASSET (Dengan Geometri PostGIS)
    // ==========================================
    console.log('📍 [SEEDER] Membuat data Aset Spasial & Non-Spasial...');

    const assetsData = [
        {
            id: 'asset-pju-001',
            kategori_id: catPju.id,
            kode_inventaris: 'PJU-KBB-PDL-001',
            nama_aset: 'Tiang PJU LED 120W Padalarang',
            kondisi: AssetCondition.BAIK,
            status_operasional: AssetState.AKTIF,
            lat: -6.8415,
            lng: 107.4930,
            alamat_fisik: 'Jl. Raya Padalarang No. 120, Kertajaya, Padalarang',
            metadata: { tipe_lampu: 'LED', daya_watt: 120, produsen: 'Philips Lumileds' }
        },
        {
            id: 'asset-pju-002',
            kategori_id: catPju.id,
            kode_inventaris: 'PJU-KBB-CKW-002',
            nama_aset: 'Tiang PJU Merkuri Cikalongwetan',
            kondisi: AssetCondition.KRITIS,
            status_operasional: AssetState.AKTIF,
            lat: -6.7580,
            lng: 107.4520,
            alamat_fisik: 'Jl. Raya Cikalongwetan KM 29, Mandalamukti',
            metadata: { tipe_lampu: 'Merkuri', daya_watt: 250, produsen: 'Sylvania' }
        },
        {
            id: 'asset-rambu-003',
            kategori_id: catRambu.id,
            kode_inventaris: 'RMB-KBB-LMB-003',
            nama_aset: 'Rambu Dilarang Parkir Lembang',
            kondisi: AssetCondition.RUSAK_RINGAN,
            status_operasional: AssetState.AKTIF,
            lat: -6.8220,
            lng: 107.6180,
            alamat_fisik: 'Jl. Raya Lembang No. 45, Lembang',
            metadata: { tipe_rambu: 'Larangan', diameter_cm: 60, reflektif: true }
        },
        {
            id: 'asset-apill-004',
            kategori_id: catApill.id,
            kode_inventaris: 'APL-KBB-LMB-004',
            nama_aset: 'Traffic Light Simpang Lembang',
            kondisi: AssetCondition.RUSAK_BERAT,
            status_operasional: AssetState.DALAM_PERBAIKAN,
            lat: -6.8222,
            lng: 107.6185,
            alamat_fisik: 'Simpang Tiga Lembang - Jl. Maribaya, Lembang',
            metadata: { jumlah_fase: 3, controller_model: 'ATC-2025', backup_battery: false }
        },
        {
            id: 'asset-rambu-005',
            kategori_id: catRambu.id,
            kode_inventaris: 'RMB-KBB-CSR-005',
            nama_aset: 'Cermin Tikungan Cisarua 02',
            kondisi: AssetCondition.HILANG,
            status_operasional: AssetState.AKTIF,
            lat: -6.8010,
            lng: 107.5450,
            alamat_fisik: 'Jl. Kolonel Masturi Tikungan Tajam 2, Jambudipa, Cisarua',
            metadata: { diameter_cm: 80, bahan: 'Polikarbonat Anti-Pecah' }
        },
        {
            id: 'asset-knd-006',
            kategori_id: catKendaraan.id,
            kode_inventaris: 'KND-KBB-PJU-001',
            nama_aset: 'Mobil Derek Tangga PJU Mitsubishi Colt',
            kondisi: AssetCondition.BAIK,
            status_operasional: AssetState.AKTIF,
            lat: null,
            lng: null,
            alamat_fisik: 'Gudang Dishub Cikamuning',
            metadata: { nomor_polisi: 'D 8120 U', kapasitas_tangga_meter: 12 }
        }
    ];

    for (const asset of assetsData) {
        const metadataJson = JSON.stringify(asset.metadata);
        if (asset.lat !== null && asset.lng !== null) {
            await prisma.$executeRaw`
                INSERT INTO "Asset" (id, kategori_id, kode_inventaris, nama_aset, kondisi, status_operasional, lat, lng, alamat_fisik, geom, metadata, "createdAt", "updatedAt")
                VALUES (
                    ${asset.id}, 
                    ${asset.kategori_id}, 
                    ${asset.kode_inventaris}, 
                    ${asset.nama_aset}, 
                    ${asset.kondisi}::"AssetCondition", 
                    ${asset.status_operasional}::"AssetState", 
                    ${asset.lat}, 
                    ${asset.lng}, 
                    ${asset.alamat_fisik}, 
                    ST_SetSRID(ST_MakePoint(${asset.lng}, ${asset.lat}), 4326), 
                    ${metadataJson}::jsonb, 
                    NOW(), 
                    NOW()
                )
            `;
        } else {
            await prisma.$executeRaw`
                INSERT INTO "Asset" (id, kategori_id, kode_inventaris, nama_aset, kondisi, status_operasional, lat, lng, alamat_fisik, geom, metadata, "createdAt", "updatedAt")
                VALUES (
                    ${asset.id}, 
                    ${asset.kategori_id}, 
                    ${asset.kode_inventaris}, 
                    ${asset.nama_aset}, 
                    ${asset.kondisi}::"AssetCondition", 
                    ${asset.status_operasional}::"AssetState", 
                    NULL, 
                    NULL, 
                    ${asset.alamat_fisik}, 
                    NULL, 
                    ${metadataJson}::jsonb, 
                    NOW(), 
                    NOW()
                )
            `;
        }
    }

    // ==========================================
    // SEEDING ASSET ASSIGNMENT
    // ==========================================
    console.log('📋 [SEEDER] Membuat data Penugasan/Peminjaman Aset...');
    await prisma.assetAssignment.create({
        data: {
            asset_id: 'asset-knd-006',
            user_id: teknisiPju.id,
            assigned_by_id: admin.id,
            kondisi_serah_terima: 'Kondisi mesin prima, kelistrikan tangga hidrolik berfungsi 100%, solar penuh.',
            foto_bukti: 'serah_terima_mobil_tangga.jpg'
        }
    });

    // ==========================================
    // SEEDING ASSET HISTORY
    // ==========================================
    console.log('🕒 [SEEDER] Membuat data Audit Trail (History Aset)...');
    await prisma.assetHistory.create({
        data: {
            asset_id: 'asset-apill-004',
            actor_id: kasi.id,
            action: 'MUTASI_STATUS_OPERASIONAL',
            old_data: { status_operasional: 'AKTIF' },
            new_data: { status_operasional: 'DALAM_PERBAIKAN' },
            keterangan: 'Status operasional diubah menjadi DALAM_PERBAIKAN setelah adanya laporan lampu kuning berkedip terus-menerus.'
        }
    });

    // ==========================================
    // SEEDING REPORT (Aduan Masyarakat)
    // ==========================================
    console.log('🚨 [SEEDER] Membuat data Laporan/Aduan Kerusakan...');

    const reportsData = [
        {
            id: 'report-001',
            ticket_number: 'LPT-20260809-0001',
            sumber_pelapor: 'WARGA',
            nama_pelapor: 'Budi Hartono (Warga)',
            kontak_pelapor: '6289999888771',
            judul_laporan: 'Lampu PJU Padalarang Padam Sejak Kemarin Malam',
            deskripsi: 'Tiang lampu jalan dekat simpang kantor desa mati total, jalanan menjadi sangat gelap gulita dan rawan kejahatan jalanan.',
            kategori_kerusakan: 'Mati Total / Tidak Berfungsi',
            lat: -6.8416,
            lng: 107.4931,
            foto_kejadian: 'bukti_pju_padalarang_mati.jpg',
            asset_id: 'asset-pju-001',
            is_valid: true,
            is_merged: false
        },
        {
            id: 'report-002',
            ticket_number: 'LPT-20260809-0002',
            sumber_pelapor: 'WARGA',
            nama_pelapor: 'Siti Rahma',
            kontak_pelapor: '6289999888772',
            judul_laporan: 'Rambu Dilarang Parkir Penyok Ditabrak Mobil',
            deskripsi: 'Rambu dilarang parkir di dekat pasar Lembang tertabrak truk pengirim sayur kemarin sore, tiangnya miring dan plat rambunya penyok.',
            kategori_kerusakan: 'Rusak Fisik / Patah',
            lat: -6.8221,
            lng: 107.6181,
            foto_kejadian: 'bukti_rambu_lembang_penyok.jpg',
            asset_id: 'asset-rambu-003',
            is_valid: true,
            is_merged: false
        },
        {
            id: 'report-003',
            ticket_number: 'LPT-20260809-0003',
            sumber_pelapor: 'WARGA',
            nama_pelapor: 'Dedi Kurniawan',
            kontak_pelapor: '6289999888773',
            judul_laporan: 'Lampu Merah Simpang Lembang Error Kuning Berkedip',
            deskripsi: 'Lampu lalu lintas di persimpangan utama Simpang Tiga Lembang - Maribaya hanya berkedip kuning sejak pagi hari, mengakibatkan lalu lintas semrawut.',
            kategori_kerusakan: 'Mati Total / Tidak Berfungsi',
            lat: -6.8223,
            lng: 107.6186,
            foto_kejadian: 'bukti_apill_lembang_error.jpg',
            asset_id: 'asset-apill-004',
            is_valid: true,
            is_merged: false
        },
        {
            id: 'report-004',
            ticket_number: 'LPT-20260809-0004',
            sumber_pelapor: 'WARGA',
            nama_pelapor: 'Yudi Cisarua',
            kontak_pelapor: '6289999888774',
            judul_laporan: 'Cermin Cembung Tikungan Cisarua Hilang Dicuri',
            deskripsi: 'Cermin tikungan di kelokan tajam Cisarua hilang, menyisakan tiang penyangganya saja. Sangat berbahaya bagi kendaraan berlawanan arah.',
            kategori_kerusakan: 'Hilang / Dicuri',
            lat: -6.8011,
            lng: 107.5451,
            foto_kejadian: 'bukti_cermin_cisarua_hilang.jpg',
            asset_id: 'asset-rambu-005',
            is_valid: true,
            is_merged: false
        }
    ];

    for (const rep of reportsData) {
        await prisma.$executeRaw`
            INSERT INTO "Report" (id, ticket_number, sumber_pelapor, nama_pelapor, kontak_pelapor, judul_laporan, deskripsi, kategori_kerusakan, lat, lng, geom, foto_kejadian, asset_id, is_valid, is_merged, "createdAt", "updatedAt")
            VALUES (
                ${rep.id}, 
                ${rep.ticket_number}, 
                ${rep.sumber_pelapor}, 
                ${rep.nama_pelapor}, 
                ${rep.kontak_pelapor}, 
                ${rep.judul_laporan}, 
                ${rep.deskripsi}, 
                ${rep.kategori_kerusakan}, 
                ${rep.lat}, 
                ${rep.lng}, 
                ST_SetSRID(ST_MakePoint(${rep.lng}, ${rep.lat}), 4326), 
                ${rep.foto_kejadian}, 
                ${rep.asset_id}, 
                ${rep.is_valid}, 
                ${rep.is_merged}, 
                NOW(), 
                NOW()
            )
        `;
    }

    // ==========================================
    // SEEDING MAINTENANCE TICKET
    // ==========================================
    console.log('🔧 [SEEDER] Membuat data Tiket Perbaikan (Work Order)...');

    // Tiket 1: Selesai
    await prisma.maintenanceTicket.create({
        data: {
            report_id: 'report-001',
            asset_id: 'asset-pju-001',
            technician_id: teknisiPju.id,
            status: TicketStatus.SELESAI,
            prioritas: 'TINGGI',
            instruksi_admin: 'Segera lakukan penggantian bohlam LED 120W dan periksa sekring pengaman di box panel.',
            catatan_teknisi: 'Bohlam LED pecah akibat korsleting air hujan. Bohlam diganti dengan unit baru Philips Lumileds dan penutup box panel dirapatkan.',
            foto_hasil: 'bukti_selesai_pju_padalarang.jpg',
            deadline_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Besok
            started_at: new Date(Date.now() - 4 * 60 * 60 * 1000),   // 4 jam lalu
            finished_at: new Date(Date.now() - 1 * 60 * 60 * 1000),  // 1 jam lalu
        }
    });

    // Tiket 2: Sedang Dikerjakan
    await prisma.maintenanceTicket.create({
        data: {
            report_id: 'report-002',
            asset_id: 'asset-rambu-003',
            technician_id: teknisiPju.id, // Budi ikut bantu seksi rambu
            status: TicketStatus.DIKERJAKAN,
            prioritas: 'NORMAL',
            instruksi_admin: 'Luruskan kembali tiang rambu lalu lintas yang miring dan perkokoh pondasi cor semennya.',
            catatan_teknisi: 'Proses penegakan tiang sudah selesai dilakukan, saat ini sedang menunggu cor beton pondasi mengering sempurna.',
            deadline_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
            started_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        }
    });

    // Tiket 3: Baru Tervalidasi (Ditugaskan)
    await prisma.maintenanceTicket.create({
        data: {
            report_id: 'report-003',
            asset_id: 'asset-apill-004',
            technician_id: teknisiApill.id,
            status: TicketStatus.TERVALIDASI,
            prioritas: 'KRITIS',
            instruksi_admin: 'Lampu APILL Simpang Lembang error kuning berkedip. Lakukan pengecekan controller board, reset modul, dan laporkan jika butuh penggantian part.',
            deadline_at: new Date(Date.now() + 12 * 60 * 60 * 1000),
        }
    });

    // Tiket 4: Menunggu Review Admin
    await prisma.maintenanceTicket.create({
        data: {
            report_id: 'report-004',
            asset_id: 'asset-rambu-005',
            technician_id: teknisiPju.id,
            status: TicketStatus.REVIEW_ADMIN,
            prioritas: 'TINGGI',
            instruksi_admin: 'Pasang unit cermin cembung baru berdiameter 80cm pada tiang bracket yang tersisa.',
            catatan_teknisi: 'Cermin tikungan baru sudah dipasang kokoh menggunakan double lock clamp agar tidak mudah dilepas atau goyang tertiup angin.',
            foto_hasil: 'bukti_selesai_cermin_cisarua.jpg',
            deadline_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
            started_at: new Date(Date.now() - 5 * 60 * 60 * 1000),
            finished_at: new Date(Date.now() - 3 * 60 * 60 * 1000),
        }
    });

    // ==========================================
    // SEEDING ANNOUNCEMENT & READ RECEIPTS
    // ==========================================
    console.log('📢 [SEEDER] Membuat data Pengumuman & Tanda Terima...');

    const ann1 = await prisma.announcement.create({
        data: {
            title: 'Apel Siaga & Pengamanan Jalur Wisata Idul Fitri',
            content: 'Diberitahukan kepada seluruh jajaran pegawai Dishub KBB, diharapkan bersiap melaksanakan apel siaga dan penugasan posko pengamanan lalu lintas menjelang mudik Lebaran. Koordinasi teknis akan dilaksanakan besok pagi.',
            target: AnnouncementTarget.SEMUA,
            is_important: true,
            author_id: kadis.id,
        }
    });

    const ann2 = await prisma.announcement.create({
        data: {
            title: 'Pelatihan Keselamatan Kerja Listrik Tegangan Tinggi PJU',
            content: 'Dikhususkan bagi para teknisi seksi PJU, wajib mengikuti kelas pelatihan K3 kelistrikan yang diselenggarakan pada hari Kamis ini di kantor workshop Dishub. Kehadiran bersifat mutlak.',
            target: AnnouncementTarget.TEKNISI,
            is_important: false,
            author_id: kadis.id,
        }
    });

    // Tanda terima
    await prisma.announcementAck.create({
        data: {
            announcement_id: ann1.id,
            user_id: teknisiPju.id,
        }
    });

    await prisma.announcementAck.create({
        data: {
            announcement_id: ann2.id,
            user_id: teknisiPju.id,
        }
    });


    // ==========================================
    // SEEDING REGION BOUNDARY (POLIGON WILAYAH)
    // ==========================================
    const geoJsonPath = path.join(__dirname, 'data', 'administrasi_desa.json');

    if (!fs.existsSync(geoJsonPath)) {
        console.warn(`⚠️ [SEEDER] File GeoJSON desa tidak ditemukan di: ${geoJsonPath}`);
        console.warn('Seeding poligon RegionBoundary dilewati. Proses seeding tetap sukses!');
    } else {
        console.log('📦 [SEEDER] Membaca file GeoJSON Batas Administrasi Desa...');
        const rawData = fs.readFileSync(geoJsonPath, 'utf-8');
        const geoJson = JSON.parse(rawData);

        if (geoJson.features && Array.isArray(geoJson.features)) {
            console.log(`🗺️ [SEEDER] Menginjeksi ${geoJson.features.length} poligon desa ke PostGIS...`);
            let successCount = 0;
            for (const feature of geoJson.features) {
                try {
                    const namaDesa = feature.properties?.NAMOBJ || feature.properties?.name || 'Tidak Diketahui';
                    const kecamatan = feature.properties?.WADMKC || feature.properties?.district || 'Tidak Diketahui';
                    const geometryJson = JSON.stringify(feature.geometry);
                    const metadataJson = JSON.stringify(feature.properties);

                    await prisma.$executeRaw`
                        INSERT INTO "RegionBoundary" (id, nama_desa, kecamatan, geom, metadata, "createdAt", "updatedAt")
                        VALUES (
                            gen_random_uuid(), 
                            ${namaDesa}, 
                            ${kecamatan}, 
                            ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(${geometryJson}), 4326)), 
                            ${metadataJson}::jsonb,
                            NOW(),
                            NOW()
                        )
                    `;
                    successCount++;
                } catch (err) {
                    // Abaikan eror parsial untuk satu poligon yang corrupt
                }
            }
            console.log(`✅ [SEEDER] Berhasil menginjeksi ${successCount} poligon batas wilayah.`);
        }
    }

    console.log('🎉 [SEEDER] Seluruh data berhasil di-seed ke database!');
    console.log(`🔑 Akun login default password: ${DEFAULT_PASSWORD}`);
    console.log('   - kadis@dishub-kbb.go.id  (Role KADIS)');
    console.log('   - admin@dishub-kbb.go.id  (Role ADMIN)');
    console.log('   - kasi@dishub-kbb.go.id   (Role KASI)');
    console.log('   - teknisi@dishub-kbb.go.id (Role TEKNISI)');
    console.log('   - warga@gmail.com         (Role MASYARAKAT)');
}

main()
    .catch((e) => {
        console.error('❌ Terjadi kesalahan fatal saat seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });