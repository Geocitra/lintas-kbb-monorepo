import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 [SEEDER] Memulai proses Seeding Database...');

    // 1. Membersihkan tabel RegionBoundary agar tidak terjadi duplikasi saat di-run ulang (Idempotent)
    console.log('🧹 [SEEDER] Membersihkan tabel RegionBoundary lama...');
    await prisma.$executeRaw`TRUNCATE TABLE "RegionBoundary" RESTART IDENTITY CASCADE;`;

    // 2. Membaca file GeoJSON 5MB
    const geoJsonPath = path.join(__dirname, 'data', 'administrasi_desa.json');

    if (!fs.existsSync(geoJsonPath)) {
        console.warn(`⚠️ [WARNING] File GeoJSON tidak ditemukan di: ${geoJsonPath}`);
        console.warn(`Silakan salin file 'administrasi_desa.json' dari project lama ke folder 'apps/api/prisma/data/'`);
        return; // Keluar dari fungsi jika file tidak ada
    }

    console.log('📦 [SEEDER] Membaca file GeoJSON (Ini mungkin memakan waktu beberapa detik)...');
    const rawData = fs.readFileSync(geoJsonPath, 'utf-8');
    const geoJson = JSON.parse(rawData);

    if (!geoJson.features || !Array.isArray(geoJson.features)) {
        throw new Error('❌ Format GeoJSON tidak valid (tidak memiliki array "features").');
    }

    console.log(`🗺️ [SEEDER] Ditemukan ${geoJson.features.length} poligon desa. Mulai injeksi ke PostGIS...`);

    let successCount = 0;
    let failCount = 0;

    // 3. Iterasi setiap poligon dan injeksi menggunakan Prisma.sql
    for (const feature of geoJson.features) {
        try {
            // Sesuaikan 'NAMOBJ' dan 'WADMKC' dengan properti asli dari file GeoJSON Dishub KBB
            const namaDesa = feature.properties?.NAMOBJ || feature.properties?.name || 'Tidak Diketahui';
            const kecamatan = feature.properties?.WADMKC || feature.properties?.district || 'Tidak Diketahui';

            // Ubah geometri object menjadi string JSON agar bisa dibaca PostGIS
            const geometryJson = JSON.stringify(feature.geometry);
            const metadataJson = JSON.stringify(feature.properties);

            // Best Practice: 
            // 1. ST_GeomFromGeoJSON -> Mengubah text GeoJSON ke Geometri DB
            // 2. ST_SetSRID -> Memastikan koordinat menggunakan standar GPS Bumi (4326)
            // 3. ST_Multi -> Memaksa Polygon menjadi MultiPolygon agar tabel tidak error tipe data
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
            console.error(`❌ Gagal injeksi desa. Error:`, err);
            failCount++;
        }
    }

    console.log(`✅ [SEEDER] Selesai! Berhasil menginjeksi ${successCount} poligon batas wilayah.`);
    if (failCount > 0) {
        console.log(`⚠️ [WARNING] Terdapat ${failCount} poligon yang gagal diinjeksi.`);
    }
}

main()
    .catch((e) => {
        console.error('❌ Terjadi kesalahan fatal saat seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });