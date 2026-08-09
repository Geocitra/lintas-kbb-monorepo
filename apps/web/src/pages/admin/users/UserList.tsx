// apps/web/src/pages/admin/users/UserList.tsx
// Manajemen User — Khusus ADMIN Sistem
import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Users, Plus, Shield, CheckCircle, XCircle, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
    KADIS:      { label: 'Kepala Dinas', cls: 'text-purple-600 font-bold' },
    ADMIN:      { label: 'Admin Sistem', cls: 'text-blue-600 font-bold' },
    KASI:       { label: 'Kepala Seksi', cls: 'text-amber-600 font-bold' },
    TEKNISI:    { label: 'Teknisi',      cls: 'text-emerald-600 font-bold' },
    MASYARAKAT: { label: 'Masyarakat',  cls: 'text-slate-500 font-bold' },
};

export default function UserList() {
    const [search, setSearch] = useState('');

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res: any = await api.get('/auth/users');
            return res.data?.data || res.data || [];
        },
    });

    const filtered = useMemo(() =>
        users.filter((u: any) =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.nip?.includes(search)
        ), [users, search]);

    const columns = useMemo<ColumnDef<any, any>[]>(() => [
        {
            accessorKey: 'name',
            header: 'NAMA',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800 text-white text-xs font-black flex items-center justify-center uppercase shrink-0">
                        {row.original.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 text-xs">{row.original.name}</p>
                        <p className="text-slate-400 text-[10px]">{row.original.email}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'nip',
            header: 'NIP',
            cell: ({ getValue }) => (
                <span className="font-mono text-xs text-slate-600">{getValue() || '—'}</span>
            ),
        },
        {
            accessorKey: 'role',
            header: 'ROLE',
            cell: ({ getValue }) => {
                const role = getValue() as string;
                const badge = ROLE_BADGE[role] || { label: role, cls: 'text-slate-500' };
                return (
                    <span className={`text-[10px] uppercase tracking-widest ${badge.cls}`}>
                        {badge.label}
                    </span>
                );
            },
        },
        {
            accessorKey: 'no_wa',
            header: 'NO. WA',
            cell: ({ getValue }) => (
                <span className="font-mono text-xs text-slate-500">{getValue() || '—'}</span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'STATUS',
            cell: ({ getValue }) => getValue()
                ? <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle size={12} /> Aktif</span>
                : <span className="flex items-center gap-1 text-rose-500 text-xs font-bold"><XCircle size={12} /> Nonaktif</span>,
        },
    ], []);

    return (
        <div className="flex flex-col min-h-full w-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800">
                        <Users size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            Manajemen User
                            <Shield size={16} className="text-slate-400" />
                        </h1>
                        <p className="text-slate-400 text-xs font-medium mt-0.5">
                            Kelola akun pegawai dan hak akses sistem
                        </p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest transition-colors">
                    <Plus size={16} />
                    Tambah User
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Cari nama, email, atau NIP..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full md:max-w-sm pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors"
                />
            </div>

            {/* Tabel */}
            <div className="bg-white border border-slate-200 shadow-sm">
                <DataTable
                    columns={columns}
                    data={filtered}
                    isLoading={isLoading}
                    pageCount={1}
                    currentPage={1}
                    onPageChange={() => {}}
                />
            </div>

            <div className="mt-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Total: {filtered.length} pengguna
                </p>
            </div>
        </div>
    );
}
