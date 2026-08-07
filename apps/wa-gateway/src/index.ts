import express, { Request, Response } from 'express';
import cors from 'cors';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';

const app = express();
const PORT = process.env.PORT || 3001; // Berjalan di Port 3001, terpisah dari API utama

app.use(cors());
app.use(express.json());

let sock: any;

async function connectToWhatsApp() {
    console.log('🔄 Memulai koneksi ke WhatsApp...');
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // Akan menampilkan QR Code di Terminal Node.js
        logger: pino({ level: 'silent' }) // Matikan log bawaan yang berisik
    });

    sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Koneksi terputus karena ', lastDisconnect?.error, ', mencoba menghubungkan ulang:', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ BOT WHATSAPP LINTAS KBB TERHUBUNG & SIAP!');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// ENDPOINT UNTUK DITEMBAK OLEH BULLMQ DARI APPS/API
app.post('/send-message', async (req: Request, res: Response) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ success: false, error: 'Phone dan Message wajib diisi' });
    }

    try {
        // Format nomor HP ke standar WhatsApp JID
        const jid = `${phone}@s.whatsapp.net`;
        
        // Cek apakah nomor tersebut terdaftar di WhatsApp
        const [result] = await sock.onWhatsApp(jid);
        if (!result || !result.exists) {
            return res.status(404).json({ success: false, error: 'Nomor WhatsApp tidak terdaftar' });
        }

        // Kirim pesan
        await sock.sendMessage(jid, { text: message });
        
        console.log(`📨 Pesan berhasil dikirim ke ${phone}`);
        res.status(200).json({ success: true, message: 'Pesan terkirim' });
    } catch (error: any) {
        console.error(`❌ Gagal mengirim pesan ke ${phone}:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mulai koneksi WA saat server menyala
connectToWhatsApp();

app.listen(PORT, () => {
    console.log(`🤖 Gateway WhatsApp berjalan di http://localhost:${PORT}`);
});
