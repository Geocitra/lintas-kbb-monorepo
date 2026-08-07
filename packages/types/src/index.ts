// packages/types/src/index.ts

// Export dari User Schema
export * from './schemas/user.schema';

// Export dari Asset Schema
export * from './schemas/asset.schema';

// Export dari Report Schema
export * from './schemas/report.schema';

// Export dari Ticket Schema
export * from './schemas/ticket.schema';

// Export dari Announcement Schema (BARU - FASE 7)
export * from './schemas/announcement.schema';

// ==========================================
// GLOBAL API RESPONSE WRAPPER
// ==========================================
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    // Menampung error validasi dari Zod secara terstruktur
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: {
        page: number;
        limit: number;
        total_data: number;
        total_pages: number;
    }
}