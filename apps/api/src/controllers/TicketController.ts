// apps/api/src/controllers/TicketController.ts
import { Request, Response, NextFunction } from 'express';
import { TicketService } from '../services/TicketService';
import { AssignTicketSchema, ExecuteTicketSchema, ReviewTicketSchema } from '@dishub/types';

const ticketService = new TicketService();

export class TicketController {

    static async assign(req: Request, res: Response, next: NextFunction) {
        try {
            const reportId = req.params.report_id as string;
            const adminId = req.user!.id;
            const validData = AssignTicketSchema.parse(req.body);

            const ticket = await ticketService.assignTicket(reportId, validData, adminId);

            res.status(200).json({
                success: true,
                message: 'Tiket berhasil ditugaskan dan SLA timer telah diaktifkan.',
                data: ticket
            });
        } catch (error) { next(error); }
    }

    static async execute(req: Request, res: Response, next: NextFunction) {
        try {
            const ticketId = req.params.ticket_id as string;
            const technicianId = req.user!.id;
            const validData = ExecuteTicketSchema.parse(req.body);

            const ticket = await ticketService.executeTicket(ticketId, validData, technicianId);

            res.status(200).json({
                success: true,
                message: 'Laporan perbaikan berhasil disubmit. Menunggu review dari Admin.',
                data: ticket
            });
        } catch (error) { next(error); }
    }

    static async review(req: Request, res: Response, next: NextFunction) {
        try {
            const ticketId = req.params.ticket_id as string;
            const adminId = req.user!.id;
            const validData = ReviewTicketSchema.parse(req.body);

            const ticket = await ticketService.reviewTicket(ticketId, validData, adminId);

            res.status(200).json({
                success: true,
                message: validData.keputusan === 'APPROVE'
                    ? 'Hasil perbaikan disetujui. Kasus ditutup.'
                    : 'Hasil perbaikan ditolak. Tiket dikembalikan ke teknisi.',
                data: ticket
            });
        } catch (error) { next(error); }
    }

    static async myTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const technicianId = req.user!.id;
            const tickets = await ticketService.getTechnicianTickets(technicianId);

            res.status(200).json({
                success: true,
                message: 'Daftar tugas Anda berhasil dimuat.',
                data: tickets
            });
        } catch (error) { next(error); }
    }

    static async index(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;

            const { tickets, total } = await ticketService.getAllTickets(page, limit, status);

            res.status(200).json({
                success: true,
                message: 'Daftar antrean tiket berhasil dimuat.',
                data: tickets,
                meta: { page, limit, total_data: total, total_pages: Math.ceil(total / limit) }
            });
        } catch (error) { next(error); }
    }
}