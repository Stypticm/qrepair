'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Smartphone,
    Calendar,
    CheckCircle2,
    Clock,
    ChevronRight,
    ArrowLeft,
    Search,
    Check,
    X,
    Zap,
    ShieldCheck,
    Package,
    Activity,
    BatteryMedium,
    Wifi,
    Droplets,
    Wrench,
    Receipt,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TradeInEvaluation {
    id: string;
    userId: string;
    category: string;
    model: string;
    variant: string | null;
    storage: string;
    color: string;
    screenCondition: string;
    bodyCondition: string;
    batteryHealth: string;
    isRostest: boolean;
    hasFullSet: boolean;
    wasRepaired: boolean;
    hasReceipt: boolean;
    isFunctional: boolean;
    isBatterySafe: boolean;
    isHardwareOk: boolean;
    isClean: boolean;
    calculatedPrice: number;
    status: string;
    createdAt: string;
}

export default function AdminTradeInPage() {
    const router = useRouter();
    const [evaluations, setEvaluations] = useState<TradeInEvaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        fetchEvaluations();
    }, []);

    const fetchEvaluations = async () => {
        try {
            const res = await fetch('/api/admin/trade-in');
            const data = await res.json();
            if (res.ok) setEvaluations(data);
        } catch (e) {
            toast.error('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const filtered = evaluations.filter(e =>
        e.model.toLowerCase().includes(search.toLowerCase()) ||
        e.userId.includes(search)
    );

    const selected = evaluations.find(e => e.id === selectedId);

    const getConditionLabel = (id: string) => {
        const labels: Record<string, string> = {
            perfect: 'Безупречный',
            good: 'Хороший',
            worn: 'Изношен',
            bad: 'Плохой'
        };
        return labels[id] || id;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleChatClick = () => {
        toast.info('Функция чата будет доступна в ближайшее время', {
            description: 'Мы работаем над интеграцией системы сообщений.',
            icon: <Info className="w-5 h-5 text-blue-500" />,
            duration: 4000
        });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/admin')}
                            className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Trade-in заявки</h1>
                            <p className="text-gray-500 text-sm">Всего оценок: {evaluations.length}</p>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Поиск по модели или ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 pr-4 py-3 bg-white border-none rounded-2xl w-full md:w-80 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* List */}
                    <div className="lg:col-span-5 space-y-4">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 animate-pulse rounded-[32px]" />)
                        ) : filtered.length === 0 ? (
                            <div className="bg-white p-12 rounded-[40px] text-center space-y-3 shadow-sm border border-dashed">
                                <Smartphone className="w-12 h-12 text-gray-200 mx-auto" />
                                <p className="text-gray-400 font-bold">Заявок не найдено</p>
                            </div>
                        ) : (
                            filtered.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedId(item.id)}
                                    className={cn(
                                        "w-full p-6 rounded-[32px] transition-all text-left flex items-center justify-between group",
                                        selectedId === item.id
                                            ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                                            : "bg-white hover:bg-gray-50 shadow-sm border border-gray-100/50"
                                    )}
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                                            selectedId === item.id ? "bg-white/20" : "bg-blue-50 text-blue-600"
                                        )}>
                                            <Smartphone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg leading-tight">iPhone {item.model}</h3>
                                            <div className="flex items-center gap-2 mt-1 opacity-70 text-xs font-bold uppercase tracking-wider">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(item.createdAt), 'd MMM HH:mm', { locale: ru })}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className={cn("w-5 h-5 transition-transform", selectedId === item.id ? "rotate-90" : "opacity-30")} />
                                </button>
                            ))
                        )}
                    </div>

                    {/* Details */}
                    <div className="lg:col-span-7">
                        <AnimatePresence mode="wait">
                            {selected ? (
                                <motion.div
                                    key={selected.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="bg-white rounded-[48px] p-8 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden h-fit"
                                >
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                                        <Smartphone className="w-64 h-64 rotate-12" />
                                    </div>

                                    <div className="relative z-10 flex flex-col gap-8">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Badge variant="outline" className="mb-3 px-3 py-1 rounded-full border-blue-100 text-blue-600 bg-blue-50/30 uppercase tracking-widest text-[10px] font-black">
                                                    ID: {selected.userId}
                                                </Badge>
                                                <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                                                    iPhone {selected.model}
                                                    {selected.variant && <span className="text-blue-600 ml-2">{selected.variant}</span>}
                                                </h2>
                                                <p className="text-gray-400 font-bold mt-1 uppercase tracking-tighter">{selected.storage} GB • {selected.color}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-gray-300 uppercase mb-1">Статус</div>
                                                <Badge className="bg-amber-500 text-white border-none rounded-xl px-4 py-1.5 font-black text-xs">
                                                    {selected.status === 'pending' ? 'ОЖИДАЕТ' : selected.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <DetailCard icon={ShieldCheck} label="Ростест" value={selected.isRostest ? 'Да' : 'Нет'} color="blue" />
                                            <DetailCard icon={Zap} label="АКБ" value={selected.batteryHealth} color="amber" />
                                            <DetailCard icon={Package} label="Комплект" value={selected.hasFullSet ? 'Полный' : 'Нет'} color="indigo" />
                                            <DetailCard icon={Activity} label="Включается" value={selected.isFunctional ? 'Да' : 'Нет'} color="green" />
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Аппаратные проверки</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <DetailCard icon={BatteryMedium} label="АКБ не вздут" value={selected.isBatterySafe ? 'Да' : 'Нет'} color={selected.isBatterySafe ? "green" : "red"} />
                                                <DetailCard icon={Wifi} label="Модули OK" value={selected.isHardwareOk ? 'Да' : 'Нет'} color={selected.isHardwareOk ? "green" : "red"} />
                                                <DetailCard icon={Droplets} label="Без окислов" value={selected.isClean ? 'Да' : 'Нет'} color={selected.isClean ? "green" : "red"} />
                                                <DetailCard icon={Wrench} label="Ремонты" value={selected.wasRepaired ? 'Были' : 'Нет'} color={selected.wasRepaired ? "amber" : "blue"} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Внешнее состояние</h4>
                                                <div className="space-y-3">
                                                    <div className="p-4 bg-gray-50 rounded-[24px] flex justify-between items-center">
                                                        <span className="text-[11px] font-bold text-gray-400 uppercase">Экран</span>
                                                        <span className="text-sm font-black text-gray-900">{getConditionLabel(selected.screenCondition)}</span>
                                                    </div>
                                                    <div className="p-4 bg-gray-50 rounded-[24px] flex justify-between items-center">
                                                        <span className="text-[11px] font-bold text-gray-400 uppercase">Корпус</span>
                                                        <span className="text-sm font-black text-gray-900">{getConditionLabel(selected.bodyCondition)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Дополнительно</h4>
                                                <div className="space-y-3">
                                                    <div className="p-4 bg-gray-50 rounded-[24px] flex justify-between items-center">
                                                        <span className="text-[11px] font-bold text-gray-400 uppercase">Есть чек</span>
                                                        <span className="text-sm font-black text-gray-900">{selected.hasReceipt ? 'Да' : 'Нет'}</span>
                                                    </div>
                                                    <div className="p-4 bg-gray-50 rounded-[24px] flex justify-between items-center">
                                                        <span className="text-[11px] font-bold text-gray-400 uppercase">Оригинал</span>
                                                        <span className="text-sm font-black text-gray-900">Да</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-blue-600 rounded-[32px] text-white flex items-center justify-between shadow-xl shadow-blue-200">
                                            <div>
                                                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Предварительная цена</p>
                                                <p className="text-3xl font-black">{formatPrice(selected.calculatedPrice)}</p>
                                            </div>
                                            <button
                                                onClick={handleChatClick}
                                                className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-blue-50 transition-colors active:scale-95"
                                            >
                                                Написать в чат
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full bg-gray-100/30 rounded-[48px] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center opacity-40">
                                    <Smartphone className="w-16 h-16 text-gray-300 mb-4" />
                                    <p className="font-black text-xl text-gray-400 uppercase tracking-tighter leading-tight">Выберите заявку<br />для просмотра деталей</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    const colors: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600",
        amber: "bg-amber-50 text-amber-600",
        green: "bg-green-50 text-green-600",
        indigo: "bg-indigo-50 text-indigo-600",
        red: "bg-red-50 text-red-600"
    };

    return (
        <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-[28px] shadow-sm">
            <div className={cn("p-3 rounded-2xl shadow-inner", colors[color])}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{label}</p>
                <p className="text-sm font-black text-gray-900">{value}</p>
            </div>
        </div>
    );
}
