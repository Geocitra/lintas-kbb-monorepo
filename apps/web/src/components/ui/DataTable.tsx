// apps/web/src/components/ui/DataTable.tsx
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Loader2, FolderGit } from 'lucide-react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    currentPage,
    onPageChange,
    isLoading = false,
}: DataTableProps<TData, TValue>) {

    // Inisialisasi Headless Table Engine
    const table = useReactTable({
        data,
        columns,
        pageCount,
        manualPagination: true, // Beritahu TanStack bahwa pagination diurus oleh Server (PostgreSQL)
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="flex flex-col w-full bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">

            {/* 1. AREA TABEL UTAMA */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="bg-slate-900 text-white text-[10px] font-black tracking-widest uppercase">
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="p-5 whitespace-nowrap">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody className="text-slate-600 text-xs font-medium divide-y divide-slate-100">
                        {isLoading ? (
                            // STATE: SEDANG LOADING (Mencegah tampilan tabel kosong tiba-tiba saat pindah halaman)
                            <tr>
                                <td colSpan={columns.length} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <Loader2 size={32} className="animate-spin text-blue-600 mb-4" />
                                        <span className="text-[10px] font-black tracking-widest uppercase animate-pulse">Menarik Data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : table.getRowModel().rows?.length ? (
                            // STATE: DATA TERSEDIA
                            table.getRowModel().rows.map((row, index) => (
                                <tr
                                    key={row.id}
                                    className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="p-5 align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            // STATE: DATA KOSONG
                            <tr>
                                <td colSpan={columns.length} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <FolderGit size={40} className="mb-4 opacity-50" />
                                        <span className="text-[10px] font-black tracking-widest uppercase">Tidak ada data ditemukan</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 2. AREA PAGINATION KONTROL */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                    Halaman {currentPage} dari {pageCount || 1}
                </span>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || isLoading}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors outline-none"
                    >
                        <ChevronLeft size={18} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= pageCount || isLoading}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors outline-none"
                    >
                        <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

        </div>
    );
}