-- CreateEnum
CREATE TYPE "Role" AS ENUM ('KADIS', 'ADMIN', 'KASI', 'TEKNISI', 'MASYARAKAT');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'KRITIS', 'HILANG');

-- CreateEnum
CREATE TYPE "AssetState" AS ENUM ('DRAFT', 'GUDANG', 'AKTIF', 'DALAM_PERBAIKAN', 'AFKIR');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('LAPORAN_MASUK', 'TERVALIDASI', 'DITUGASKAN', 'DIKERJAKAN', 'REVIEW_ADMIN', 'SELESAI', 'DITOLAK');

-- CreateTable
CREATE TABLE "Seksi" (
    "id" TEXT NOT NULL,
    "nama_seksi" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Seksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nip" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "no_wa" TEXT,
    "role" "Role" NOT NULL DEFAULT 'TEKNISI',
    "seksi_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "is_spatial" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "kategori_id" TEXT NOT NULL,
    "kode_inventaris" TEXT,
    "nama_aset" TEXT NOT NULL,
    "kondisi" "AssetCondition" NOT NULL DEFAULT 'BAIK',
    "status_operasional" "AssetState" NOT NULL DEFAULT 'DRAFT',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "alamat_fisik" TEXT,
    "geom" geometry(Point, 4326),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "foto_utama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetAssignment" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "assigned_by_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMP(3),
    "kondisi_serah_terima" TEXT,
    "kondisi_dikembalikan" TEXT,
    "foto_bukti" TEXT,

    CONSTRAINT "AssetAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetHistory" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "ticket_number" TEXT NOT NULL,
    "sumber_pelapor" TEXT NOT NULL,
    "nama_pelapor" TEXT NOT NULL,
    "kontak_pelapor" TEXT,
    "judul_laporan" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "geom" geometry(Point, 4326),
    "foto_kejadian" TEXT,
    "asset_id" TEXT,
    "is_valid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceTicket" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "technician_id" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'TERVALIDASI',
    "prioritas" TEXT NOT NULL DEFAULT 'NORMAL',
    "instruksi_admin" TEXT,
    "catatan_teknisi" TEXT,
    "foto_hasil" TEXT,
    "deadline_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seksi_nama_seksi_key" ON "Seksi"("nama_seksi");

-- CreateIndex
CREATE UNIQUE INDEX "User_nip_key" ON "User"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_kode_key" ON "Category"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_kode_inventaris_key" ON "Asset"("kode_inventaris");

-- CreateIndex
CREATE INDEX "Asset_geom_idx" ON "Asset" USING GIST ("geom");

-- CreateIndex
CREATE INDEX "Asset_status_operasional_idx" ON "Asset"("status_operasional");

-- CreateIndex
CREATE INDEX "AssetAssignment_asset_id_returned_at_idx" ON "AssetAssignment"("asset_id", "returned_at");

-- CreateIndex
CREATE UNIQUE INDEX "Report_ticket_number_key" ON "Report"("ticket_number");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceTicket_report_id_key" ON "MaintenanceTicket"("report_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_seksi_id_fkey" FOREIGN KEY ("seksi_id") REFERENCES "Seksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetHistory" ADD CONSTRAINT "AssetHistory_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetHistory" ADD CONSTRAINT "AssetHistory_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
