// apps/web/src/hooks/useTicketStorage.ts
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'lintas_kbb_my_tickets';

export interface SavedTicket {
    ticket_number: string;
    saved_at: string;
}

export function useTicketStorage() {
    const [savedTickets, setSavedTickets] = useState<SavedTicket[]>([]);

    // 1. Tarik data dari Local Storage saat komponen di-mount pertama kali
    useEffect(() => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    setSavedTickets(parsed);
                }
            }
        } catch (error) {
            console.error('[TicketStorage] Gagal mem-parsing data tiket dari local storage', error);
            // Fallback: Bersihkan data yang korup
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    // 2. Fungsi Menambah Tiket Baru (Cegah Duplikasi)
    const addTicket = useCallback((ticketNumber: string) => {
        setSavedTickets((prev) => {
            // Jika tiket sudah ada, jangan ditambahkan lagi
            if (prev.some(t => t.ticket_number === ticketNumber)) {
                return prev;
            }

            const newTicket: SavedTicket = {
                ticket_number: ticketNumber,
                saved_at: new Date().toISOString(),
            };

            // Susun agar tiket terbaru berada di urutan teratas (Prepend)
            const updatedList = [newTicket, ...prev];

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
            return updatedList;
        });
    }, []);

    // 3. Fungsi Menghapus Tiket (Misal: warga ingin menyembunyikan riwayat tiket lama)
    const removeTicket = useCallback((ticketNumber: string) => {
        setSavedTickets((prev) => {
            const updatedList = prev.filter(t => t.ticket_number !== ticketNumber);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
            return updatedList;
        });
    }, []);

    // 4. Hapus Semua Riwayat
    const clearAll = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setSavedTickets([]);
    }, []);

    return { savedTickets, addTicket, removeTicket, clearAll };
}