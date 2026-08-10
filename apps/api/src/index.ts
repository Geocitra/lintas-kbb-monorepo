// apps/api/src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { SocketServer } from './utils/SocketServer';
import path from 'path';

import { errorHandler } from './middlewares/errorHandler';

// Import All Routers
import assetRoutes from './routes/assetRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import spatialRoutes from './routes/spatialRoutes';
import reportRoutes from './routes/reportRoutes';
import ticketRoutes from './routes/ticketRoutes';
import authRoutes from './routes/authRoutes';
import auditRoutes from './routes/auditRoutes';
import announcementRoutes from './routes/announcementRoutes'; 
import dashboardRoutes from './routes/dashboardRoutes';
import masterRoutes from './routes/masterRoutes';

// Import Pekerja Latar Belakang (BullMQ Worker)
import { setupEscalationWorker } from './jobs/escalationJob';
import { setupNotificationWorker } from './jobs/notificationJob';

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARES (Security, Logger, Parser)
// ==========================================
// Konfigurasi Helmet: Mengizinkan Cross-Origin Resource Policy agar React (Port 5173) 
// bisa me-load gambar dari Express (Port 3000) tanpa diblokir oleh browser.
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Dukungan ekstra form-urlencoded
app.use(morgan('dev'));

// ==========================================
// STATIC FILE SERVING (STORAGE GATEWAY)
// ==========================================
// Mengekspos folder 'public/uploads' agar file foto bisa diakses via HTTP URL
const uploadsPath = path.join(process.cwd(), 'public/uploads');
app.use('/uploads', express.static(uploadsPath));

// ==========================================
// ROUTES
// ==========================================
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'LINTAS KBB API Server is running smoothly!',
        timestamp: new Date().toISOString()
    });
});

// Register Domain Routes 
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/spatial', spatialRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/announcements', announcementRoutes); 
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1', masterRoutes);
app.use('/api/v1/master', masterRoutes);

// ==========================================
// GLOBAL ERROR HANDLER (Harus berada di paling bawah)
// ==========================================
app.use(errorHandler);

// ==========================================
// SERVER, WEBSOCKET & BACKGROUND JOBS START
// ==========================================
const httpServer = createServer(app);

// Inisialisasi WebSocket menggunakan HTTP Server
SocketServer.init(httpServer);

httpServer.listen(PORT, () => {
    console.log(`🚀 [LINTAS Core API] Server berjalan di http://localhost:${PORT}`);
    console.log(`🔌 [WebSocket] Real-time engine aktif!`);
    console.log(`🛡️  Environment: ${process.env.NODE_ENV}`);
    console.log(`📂  Static Storage Path: ${uploadsPath}`);

    // MENYALAKAN WORKER BULLMQ DI LATAR BELAKANG
    try {
        setupEscalationWorker();
        setupNotificationWorker();
    } catch (err) {
        console.error(`⚠️ [Peringatan] Gagal menyalakan Background Worker. Pastikan Redis menyala.`, err);
    }
});