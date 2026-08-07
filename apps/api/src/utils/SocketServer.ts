// apps/api/src/utils/SocketServer.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

export class SocketServer {
    private static io: Server;

    static init(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || '*',
                methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
            }
        });

        this.io.on('connection', (socket: Socket) => {
            console.log(`🔌 [WebSocket] Klien terhubung: ${socket.id}`);

            // Klien bisa bergabung ke "ruangan" khusus berdasarkan role mereka
            socket.on('join_room', (room: string) => {
                socket.join(room);
                console.log(`🔌 [WebSocket] Klien ${socket.id} bergabung ke room: ${room}`);
            });

            socket.on('disconnect', () => {
                console.log(`🔌 [WebSocket] Klien terputus: ${socket.id}`);
            });
        });
    }

    // Fungsi ini akan dipanggil oleh Service (ReportService, TicketService, dll)
    static emitToRoom(room: string, event: string, data: any) {
        if (this.io) {
            this.io.to(room).emit(event, data);
        }
    }

    static emitToAll(event: string, data: any) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
}
