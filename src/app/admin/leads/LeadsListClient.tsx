'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
    Phone,
    User,
    Calendar,
    Smartphone,
    CheckCircle2,
    Clock,
    MoreHorizontal,
    ExternalLink,
    Loader2,
    ShoppingBag
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface QuickLead {
    id: string;
    name: string;
    phone: string;
    productId: string | null;
    productTitle: string | null;
    price: number | null;
    telegramId: string | null;
    status: string;
    isRead: boolean;
    createdAt: string;
}

export function LeadsListClient() {
    const [leads, setLeads] = useState<QuickLead[]>([]);
    const [loading, setLoading] = useState(true);
    const { telegramId: adminTgId } = useAppStore();

    const fetchLeads = async () => {
        try {
            const tg = (window as any).Telegram?.WebApp;
            const initData = tg?.initData || '';

            const response = await fetch('/api/admin/leads', {
                headers: {
                    'x-telegram-init-data': initData,
                    'x-telegram-id': adminTgId || ''
                }
            });
            if (response.ok) {
                const data = await response.json();
                setLeads(data);

                // Auto-mark as read after viewing
                if (data.some((l: QuickLead) => !l.isRead)) {
                    fetch('/api/admin/leads/mark-read', {
                        method: 'POST',
                        headers: {
                            'x-telegram-init-data': initData,
                            'x-telegram-id': adminTgId || ''
                        }
                    }).catch(console.error);
                }
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const tg = (window as any).Telegram?.WebApp;
            const initData = tg?.initData || '';

            const response = await fetch('/api/admin/leads', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-init-data': initData,
                    'x-telegram-id': adminTgId || ''
                },
                body: JSON.stringify({ id, status: newStatus })
            });

            if (response.ok) {
                setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    useEffect(() => {
        fetchLeads();
        // Set up poll every 30s
        const interval = setInterval(fetchLeads, 30000);
        return () => clearInterval(interval);
    }, [adminTgId]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new':
                return <Badge className="bg-red-500 hover:bg-red-600 text-white border-none">Новый</Badge>;
            case 'contacted':
                return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none">В работе</Badge>;
            case 'closed':
                return <Badge className="bg-green-500 hover:bg-green-600 text-white border-none">Завершен</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">Загрузка заявок...</p>
            </div>
        );
    }

    if (leads.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Заявок пока нет</h3>
                <p className="text-gray-500">Как только кто-то нажмет «Купить в 1 клик», заявка появится здесь.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {leads.map((lead) => (
                <Card key={lead.id} className={cn(
                    "overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl bg-white",
                    !lead.isRead && "ring-1 ring-red-100 bg-red-50/10"
                )}>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1 space-y-4">
                                {/* Header: Status and Date */}
                                <div className="flex items-center justify-between md:justify-start gap-4">
                                    {getStatusBadge(lead.status)}
                                    <div className="flex items-center text-xs text-gray-400 font-medium">
                                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                                        {format(new Date(lead.createdAt), 'd MMMM, HH:mm', { locale: ru })}
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center group">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mr-3 group-hover:bg-gray-100 transition-colors">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Клиент</p>
                                            <p className="font-bold text-gray-900">{lead.name}</p>
                                        </div>
                                    </div>

                                    <a
                                        href={`tel:${lead.phone.replace(/\D/g, '')}`}
                                        className="flex items-center group"
                                    >
                                        <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center mr-3 group-hover:bg-teal-100 transition-colors">
                                            <Phone className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Телефон</p>
                                            <p className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{lead.phone}</p>
                                        </div>
                                    </a>
                                </div>

                                {/* Product Info */}
                                {lead.productTitle && (
                                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between group cursor-default">
                                        <div className="flex items-center">
                                            <Smartphone className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 line-clamp-1">{lead.productTitle}</p>
                                                <p className="text-xs text-gray-500">{lead.price?.toLocaleString()} ₽</p>
                                            </div>
                                        </div>
                                        {lead.productId && (
                                            <Link
                                                href={`/market/${lead.productId}`}
                                                className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"
                                            >
                                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center md:flex-col gap-2 md:pl-6 md:border-l border-gray-100 min-w-[140px]">
                                <div className="w-full space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Статус</p>
                                    <select
                                        className="w-full h-12 bg-white border border-gray-100 rounded-2xl px-4 font-bold text-sm focus:ring-2 focus:ring-teal-500 transition-all outline-none appearance-none cursor-pointer"
                                        value={lead.status}
                                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                                    >
                                        <option value="new">Новый</option>
                                        <option value="contacted">В работе</option>
                                        <option value="closed">Завершен</option>
                                    </select>
                                </div>

                                {lead.status === 'new' && (
                                    <Button
                                        onClick={() => updateStatus(lead.id, 'contacted')}
                                        className="flex-1 md:w-full h-12 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold mt-1"
                                    >
                                        Принять
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
