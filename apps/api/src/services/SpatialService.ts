// apps/api/src/services/SpatialService.ts
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

// Tipe kembalian (Return Type) untuk query spasial agar Type-Safe
export interface NearestAssetResult {
  id: string;
  nama_aset: string;
  kode_inventaris: string;
  kategori_id: string;
  kondisi: string;
  lat: number;
  lng: number;
  distance_meters: number;
}

export interface ViewportAssetResult {
  id: string;
  nama_aset: string;
  kondisi: string;
  kategori_nama: string;
  lat: number;
  lng: number;
  is_cluster?: boolean;
  cluster_count?: number;
}

export class SpatialService {

  /**
   * 1. FIND NEAREST ASSET (Socio-Engineering & Validasi Laporan)
   * Digunakan saat teknisi/warga lapor. Mencari aset dalam radius X meter.
   */
  async findNearestAssets(lat: number, lng: number, radiusMeters: number = 100): Promise<NearestAssetResult[]> {
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new AppError('Kordinat GPS tidak valid secara geografis', 400);
    }

    const nearestAssets = await prisma.$queryRaw<NearestAssetResult[]>`
      SELECT 
        a.id, 
        a.nama_aset, 
        a.kode_inventaris, 
        a.kategori_id, 
        a.kondisi::text,
        ST_Y(a.geom::geometry) as lat, 
        ST_X(a.geom::geometry) as lng,
        ROUND(ST_DistanceSphere(a.geom, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326))::numeric, 2) as distance_meters
      FROM "Asset" a
      WHERE ST_DWithin(a.geom::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters})
        AND a.status_operasional = 'AKTIF'
      ORDER BY a.geom <-> ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      LIMIT 10;
    `;

    return nearestAssets;
  }

  /**
   * 2. VIEWPORT BOUNDING BOX (Optimalisasi UI)
   */
  async getAssetsInViewport(minLat: number, minLng: number, maxLat: number, maxLng: number, zoom: number): Promise<ViewportAssetResult[]> {
    if (zoom < 12) {
      const gridSize = zoom < 10 ? 0.08 : 0.02;

      const clusters = await prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(a.id)::int as cluster_count,
          ST_Y(ST_Centroid(ST_Collect(a.geom::geometry))) as lat,
          ST_X(ST_Centroid(ST_Collect(a.geom::geometry))) as lng,
          MIN(c.nama) as dominant_category
        FROM "Asset" a
        JOIN "Category" c ON a.kategori_id = c.id
        WHERE ST_Contains(ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326), a.geom)
        GROUP BY ST_SnapToGrid(a.geom::geometry, ${gridSize});
      `;

      return clusters.map(c => ({
        id: `cluster-${c.lat}-${c.lng}`,
        is_cluster: true,
        cluster_count: c.cluster_count,
        nama_aset: `Klaster ${c.dominant_category}`,
        kategori_nama: 'Klaster',
        kondisi: 'BAIK',
        lat: c.lat,
        lng: c.lng
      }));
    }

    const assets = await prisma.$queryRaw<any[]>`
      SELECT 
        a.id,
        a.nama_aset,
        a.kondisi::text,
        c.nama as kategori_nama,
        ST_Y(a.geom::geometry) as lat,
        ST_X(a.geom::geometry) as lng
      FROM "Asset" a
      JOIN "Category" c ON a.kategori_id = c.id
      WHERE ST_Contains(ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326), a.geom)
      LIMIT 1000;
    `;

    return assets.map(a => ({ ...a, is_cluster: false }));
  }

  /**
   * 3. MENGHITUNG JARAK ABSOLUT (Anti-Fake GPS)
   * Digunakan oleh ReportService untuk memvalidasi jarak warga dengan aset
   */
  async getAbsoluteDistance(assetId: string, reporterLat: number, reporterLng: number): Promise<number | null> {
    const result = await prisma.$queryRaw<any[]>`
      SELECT ST_DistanceSphere(
        geom, 
        ST_SetSRID(ST_MakePoint(${reporterLng}, ${reporterLat}), 4326)
      ) as distance_meters
      FROM "Asset" 
      WHERE id = ${assetId};
    `;

    if (!result || result.length === 0) return null;
    return parseFloat(result[0].distance_meters);
  }

  /**
   * 4. VECTOR TILE DOWNSAMPLING (Solusi Freeze Browser)
   * Ditarik dari SpatialController. Meringankan file GeoJSON 5MB.
   */
  async getSimplifiedBoundaries(zoomLevel: number): Promise<any> {
    // Toleransi penyederhanaan poligon
    let tolerance = 0.001;
    if (zoomLevel <= 10) tolerance = 0.01;
    else if (zoomLevel <= 12) tolerance = 0.005;

    const result = await prisma.$queryRaw<any[]>`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
      ) as geojson
      FROM (
        SELECT 
          id, 
          nama_desa, 
          kecamatan, 
          metadata,
          ST_SimplifyPreserveTopology(geom::geometry, ${tolerance}) as geom
        FROM "RegionBoundary"
      ) as t;
    `;

    return result[0]?.geojson || { type: 'FeatureCollection', features: [] };
  }
}