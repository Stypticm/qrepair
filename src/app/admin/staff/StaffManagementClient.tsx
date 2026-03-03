'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Loader2, UserCog, Search, ShieldCheck, Truck, Wrench, User, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface StaffUser {
    id: string;
    telegramId: string;
    role: 'USER' | 'ADMIN' | 'MASTER' | 'MANAGER' | 'COURIER';
    createdAt: string;
}

const ROLE_ICONS = {
    USER: User,
    ADMIN: ShieldAlert,
    MASTER: Wrench,
    MANAGER: ShieldCheck,
    COURIER: Truck,
};

export default function StaffManagementPage() {
    const { telegramId } = useAppStore();
    const [users, setUsers] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'staff' | 'clients'>('staff');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const STAFF_ROLES = ['ADMIN', 'MANAGER', 'MASTER', 'COURIER'];
    const CLIENT_ROLES = ['USER'];

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/staff', {
                headers: { 'x-admin-id': telegramId || '' }
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setUsers(data.users);
        } catch (error) {
            toast.error('Ошибка при загрузке списка персонала');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (telegramId) fetchUsers();
    }, [telegramId]);

    const updateRole = async (userId: string, newRole: string) => {
        try {
            const res = await fetch('/api/admin/staff', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-id': telegramId || ''
                },
                body: JSON.stringify({ userId, role: newRole }),
            });

            if (!res.ok) throw new Error('Update failed');

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
            toast.success('Роль успешно обновлена');
        } catch (error) {
            toast.error('Ошибка при смене роли');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesFilter = filterType === 'staff'
            ? STAFF_ROLES.includes(u.role)
            : CLIENT_ROLES.includes(u.role);
        const matchesSearch = u.telegramId.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <UserCog className="w-6 h-6" />
                    Управление персоналом
                </h2>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    {/* Filter Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => setFilterType('staff')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === 'staff'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Персонал
                        </button>
                        <button
                            onClick={() => setFilterType('clients')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === 'clients'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Клиенты
                        </button>
                    </div>

                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Поиск по Telegram ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm font-medium">
                            <tr>
                                <th className="px-3 sm:px-6 py-4">ID</th>
                                <th className="px-3 sm:px-6 py-4">Роль</th>
                                <th className="px-3 sm:px-6 py-4 text-right">Действие</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => {
                                const Icon = ROLE_ICONS[user.role] || User;
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-3 sm:px-6 py-4">
                                            <div
                                                className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none"
                                                title={user.telegramId}
                                                onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-600 hidden sm:flex">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    <span className="sm:hidden">
                                                        {expandedId === user.id
                                                            ? user.telegramId
                                                            : (user.telegramId.length > 6 ? user.telegramId.slice(0, 3) + '...' : user.telegramId)
                                                        }
                                                    </span>
                                                    <span className="hidden sm:inline">
                                                        {user.telegramId}
                                                    </span>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                                    user.role === 'COURIER' ? 'bg-orange-100 text-orange-800' :
                                                        user.role === 'MASTER' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-4 text-right">
                                            <select
                                                value={user.role}
                                                onChange={(e) => updateRole(user.id, e.target.value)}
                                                className="p-1 sm:p-2 text-xs sm:text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            >
                                                <option value="USER">USER</option>
                                                <option value="COURIER">COURIER</option>
                                                <option value="MASTER">MASTER</option>
                                                <option value="MANAGER">MANAGER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
