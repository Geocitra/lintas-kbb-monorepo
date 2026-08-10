// apps/api/src/utils/ExportGenerator.ts
import { Response } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export class ExportGenerator {

    // ==========================================
    // EXCEL GENERATOR (ON-THE-FLY STREAM)
    // ==========================================
    static async generateExcel(res: Response, data: any[]) {
        // 1. Set Header HTTP untuk memaksa Browser mendownload file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Laporan_Aset_Dishub.xlsx"');

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'LINTAS';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Data Aset');

        // 2. Setup Kolom Header
        worksheet.columns = [
            { header: 'NO', key: 'no', width: 5 },
            { header: 'KODE INVENTARIS', key: 'kode', width: 20 },
            { header: 'NAMA ASET', key: 'nama', width: 30 },
            { header: 'KATEGORI', key: 'kategori', width: 25 },
            { header: 'KONDISI', key: 'kondisi', width: 15 },
            { header: 'STATUS OPERASIONAL', key: 'status', width: 20 },
            { header: 'LOKASI / ALAMAT', key: 'lokasi', width: 40 },
        ];

        // Styling Header
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0B2A4A' } // Warna Biru Dishub
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // 3. Masukkan Data (Mapping)
        data.forEach((asset, index) => {
            worksheet.addRow({
                no: index + 1,
                kode: asset.kode_inventaris || '-',
                nama: asset.nama_aset,
                kategori: asset.kategori?.nama || '-',
                kondisi: asset.kondisi,
                status: asset.status_operasional,
                lokasi: asset.alamat_fisik || 'Tidak ada data lokasi'
            });
        });

        // 4. Alirkan (Stream) Workbook langsung ke HTTP Response
        await workbook.xlsx.write(res);
        res.end();
    }

    // ==========================================
    // PDF GENERATOR (ON-THE-FLY STREAM)
    // ==========================================
    static generatePDF(res: Response, data: any[]) {
        // 1. Set Header HTTP untuk PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Laporan_Aset_Dishub.pdf"');

        // 2. Inisialisasi Dokumen PDF
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

        // Pipa (Pipe) dokumen ke HTTP Response
        doc.pipe(res);

        // 3. Gambar Kop Surat Birokrasi
        doc.fontSize(14).font('Helvetica-Bold').text('PEMERINTAH KABUPATEN BANDUNG BARAT', { align: 'center' });
        doc.fontSize(16).text('DINAS PERHUBUNGAN', { align: 'center' });
        doc.fontSize(10).font('Helvetica').text('Aplikasi LINTAS - Layanan Inventaris & Sistem Tata Aset', { align: 'center' });

        // Garis Pemisah Kop
        doc.moveTo(30, 90).lineTo(810, 90).lineWidth(2).stroke();
        doc.moveTo(30, 93).lineTo(810, 93).lineWidth(1).stroke();

        doc.moveDown(3);
        doc.fontSize(12).font('Helvetica-Bold').text('LAPORAN DAFTAR INVENTARIS ASET', { align: 'center' });
        doc.fontSize(9).font('Helvetica').text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });
        doc.moveDown(2);

        // 4. Menggambar Tabel Manual (Sederhana)
        const tableTop = 180;
        const itemX = [30, 60, 200, 400, 520, 620, 810]; // Titik pembatas kolom X (Landscape)

        // Header Tabel
        doc.font('Helvetica-Bold').fontSize(9);
        doc.text('NO', itemX[0] + 5, tableTop);
        doc.text('NAMA ASET', itemX[1] + 5, tableTop);
        doc.text('KATEGORI', itemX[2] + 5, tableTop);
        doc.text('KONDISI', itemX[3] + 5, tableTop);
        doc.text('STATUS', itemX[4] + 5, tableTop);
        doc.text('LOKASI', itemX[5] + 5, tableTop);

        doc.moveTo(30, tableTop + 15).lineTo(810, tableTop + 15).lineWidth(1).stroke();

        // Isi Data Tabel
        doc.font('Helvetica').fontSize(8);
        let yPosition = tableTop + 25;

        data.forEach((asset, index) => {
            // Fitur Halaman Baru Otomatis
            if (yPosition > 520) {
                doc.addPage();
                yPosition = 50; // Reset ke atas untuk halaman baru
            }

            doc.text(`${index + 1}`, itemX[0] + 5, yPosition);
            doc.text(`${asset.nama_aset}`, itemX[1] + 5, yPosition, { width: 130 });
            doc.text(`${asset.kategori?.nama || '-'}`, itemX[2] + 5, yPosition, { width: 190 });
            doc.text(`${asset.kondisi}`, itemX[3] + 5, yPosition);
            doc.text(`${asset.status_operasional}`, itemX[4] + 5, yPosition);
            doc.text(`${asset.alamat_fisik || '-'}`, itemX[5] + 5, yPosition, { width: 180, lineBreak: true });

            yPosition += 20; // Jarak antar baris
            doc.moveTo(30, yPosition - 5).lineTo(810, yPosition - 5).lineWidth(0.5).strokeColor('#e2e8f0').stroke();
        });

        // 5. Tutup Dokumen (Ini akan mengakhiri HTTP Response stream secara otomatis)
        doc.end();
    }
}