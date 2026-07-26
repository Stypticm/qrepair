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
    const { authToken } = useAppStore();
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
                headers: { 'Authorization': `Bearer ${authToken}` }
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
        if (authToken) fetchUsers();
    }, [authToken]);

    const updateRole = async (userId: string, newRole: string) => {
        try {
            const res = await fetch('/api/admin/staff', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
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
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <UserCog className="w-6 h-6" />
                    Управление персоналом
                </h2>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    {/* Filter Tabs */}
                    <div className="flex p-1 bg-gray-100 dark:bg-white/10 rounded-xl">
                        <button
                            onClick={() => setFilterType('staff')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === 'staff'
                                ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Персонал
                        </button>
                        <button
                            onClick={() => setFilterType('clients')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === 'clients'
                                ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Клиенты
                        </button>
                    </div>

                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Поиск по Telegram ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 text-sm font-medium">
                            <tr>
                                <th className="px-3 sm:px-6 py-4">ID</th>
                                <th className="px-3 sm:px-6 py-4">Роль</th>
                                <th className="px-3 sm:px-6 py-4 text-right">Действие</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {filteredUsers.map((user) => {
                                const Icon = ROLE_ICONS[user.role] || User;
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-3 sm:px-6 py-4">
                                            <div
                                                className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none"
                                                title={user.telegramId}
                                                onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400 hidden sm:flex">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">
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
                        ${user.role === 'ADMIN' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300' :
                                                    user.role === 'COURIER' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300' :
                                                        user.role === 'MASTER' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' :
                                                            'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-4 text-right">
                                            <select
                                                value={user.role}
                                                onChange={(e) => updateRole(user.id, e.target.value)}
                                                className="p-1 sm:p-2 text-xs sm:text-sm border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
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
