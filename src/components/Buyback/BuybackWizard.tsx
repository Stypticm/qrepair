'use client';

import {
    Smartphone,
    Tablet,
    Laptop,
    Watch,
    Check,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Undo2,
    Info,
    ShieldCheck,
    Zap,
    Package,
    Receipt,
    Wrench,
    Activity,
    BatteryMedium,
    Wifi,
    Droplets
} from 'lucide-react';
import { useAppStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// --- Types & Constants ---

type Step =
    | 'category'
    | 'specs'
    | 'check-primary'
    | 'screen-condition'
    | 'body-condition'
    | 'rostest'
    | 'health'
    | 'functional-checks'
    | 'history'
    | 'summary';

interface WizardState {
    category: string;
    model: string;
    variant: string;
    storage: string;
    color: string;
    isOriginal: boolean;
    isReset: boolean;
    screenCondition: 'perfect' | 'good' | 'worn' | 'bad' | '';
    bodyCondition: 'perfect' | 'good' | 'worn' | 'bad' | '';
    isRostest: boolean;
    batteryHealth: string;
    hasFullSet: boolean;
    wasRepaired: boolean;
    hasReceipt: boolean;
    isFunctional: boolean;
    isBatterySafe: boolean;
    isHardwareOk: boolean;
    isClean: boolean;
}

const INITIAL_STATE: WizardState = {
    category: '',
    model: '',
    variant: '',
    storage: '',
    color: '',
    isOriginal: true,
    isReset: true,
    screenCondition: '',
    bodyCondition: '',
    isRostest: true,
    batteryHealth: '100%',
    hasFullSet: true,
    wasRepaired: false,
    hasReceipt: false,
    isFunctional: true,
    isBatterySafe: true,
    isHardwareOk: true,
    isClean: true,
};

const IPHONE_COLORS = [
    { name: 'Natural Titanium', hex: '#bab6b3' },
    { name: 'Desert Titanium', hex: '#b29f8f' },
    { name: 'Black Titanium', hex: '#35393b' },
    { name: 'White Titanium', hex: '#f2f1ed' },
    { name: 'Blue Titanium', hex: '#31353a' },
    { name: 'Midnight', hex: '#2b3035' },
    { name: 'Starlight', hex: '#f0ece8' },
    { name: 'Space Black', hex: '#2c2c2c' },
    { name: 'Deep Purple', hex: '#4b3d4d' },
    { name: 'Gold', hex: '#f5e5c8' },
    { name: 'Silver', hex: '#e3e4e5' },
    { name: 'Blue', hex: '#a7c1d2' },
    { name: 'Pink', hex: '#fbe2dd' },
    { name: 'Yellow', hex: '#f9e48c' },
    { name: 'Green', hex: '#d1e1d4' },
    { name: '(PRODUCT)RED', hex: '#e11c2a' },
];

const CATEGORIES = [
    { id: 'iphone', name: 'iPhone', icon: Smartphone, active: true },
    { id: 'ipad', name: 'iPad', icon: Tablet, active: false },
    { id: 'mac', name: 'Mac', icon: Laptop, active: false },
    { id: 'watch', name: 'Apple Watch', icon: Watch, active: false },
];

const CONDITIONS = [
    {
        id: 'perfect',
        title: 'Безупречный',
        desc: 'Безупречный внешний вид без видимых царапин. На экране нет дефектных пикселей.'
    },
    {
        id: 'good',
        title: 'Хороший',
        desc: 'Несколько слабых следов износа, незаметных с расстояния. Без трещин.'
    },
    {
        id: 'worn',
        title: 'Изношен',
        desc: 'Видимые признаки износа, глубокие царапины и/или вмятины на корпусе.'
    },
    {
        id: 'bad',
        title: 'Плохое',
        desc: 'Имеет трещины, сколы или дефекты матрицы (битые пиксели, полосы).'
    },
];

const BinaryToggle = ({ label, value, onChange, desc, icon: Icon }: { label: string, value: boolean, onChange: (val: boolean) => void, desc?: string, icon?: any }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all group">
        <div className="flex gap-3 items-center">
            {Icon && (
                <div className={cn("p-2 rounded-xl transition-colors", value ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-400")}>
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 leading-tight">{label}</span>
                {desc && <span className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{desc}</span>}
            </div>
        </div>
        <div className="flex p-1 bg-gray-200 rounded-xl">
            <button
                onClick={() => onChange(true)}
                className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                    value ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                )}
            >
                Да
            </button>
            <button
                onClick={() => onChange(false)}
                className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                    !value ? "bg-white text-red-600 shadow-sm" : "text-gray-500"
                )}
            >
                Нет
            </button>
        </div>
    </div>
);

const ConditionCard = ({ title, desc, selected, onClick }: { title: string, desc: string, selected: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden",
            selected
                ? "border-blue-500 bg-blue-50/30 ring-4 ring-blue-500/5"
                : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
        )}
    >
        <div className="flex justify-between items-center mb-1">
            <span className={cn("text-base font-black truncate", selected ? "text-blue-700" : "text-gray-900")}>
                {title}
            </span>
            <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                selected ? "border-blue-500 bg-blue-500 text-white" : "border-gray-200"
            )}>
                {selected && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
        </div>
        <p className={cn("text-[11px] leading-tight line-clamp-2", selected ? "text-blue-600/80" : "text-gray-500")}>
            {desc}
        </p>
    </button>
);

const STEPS: Step[] = [
    'category', 'specs', 'check-primary', 'screen-condition',
    'body-condition', 'rostest', 'health', 'functional-checks', 'history', 'summary'
];

export function BuybackWizard({ onComplete }: { onComplete?: () => void }) {
    const router = useRouter();
    const { telegramId } = useAppStore();
    const [step, setStep] = useState<Step>('category');
    const [state, setState] = useState<WizardState>(INITIAL_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateState = (updates: Partial<WizardState>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const nextStep = (next: Step) => setStep(next);
    const prevStep = (prev: Step) => setStep(prev);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/trade-in/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-id': telegramId || '',
                },
                body: JSON.stringify(state),
            });

            if (response.ok) {
                toast.success('Заявка на оценку принята! Сейчас вы будете перенаправлены.', {
                    duration: 3000,
                });
                setTimeout(() => {
                    if (onComplete) onComplete();
                    router.push('/');
                }, 3000);
            } else {
                toast.error('Произошла ошибка при сохранении');
            }
        } catch (e) {
            toast.error('Ошибка сети');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'category':
                return (
                    <div className="grid grid-cols-2 gap-3 p-1">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                disabled={!cat.active}
                                onClick={() => {
                                    updateState({ category: cat.name });
                                    nextStep('specs');
                                }}
                                className={cn(
                                    "flex flex-col items-center justify-center p-6 rounded-[28px] border-2 transition-all relative group h-40",
                                    cat.active
                                        ? "bg-white border-gray-100 hover:border-blue-500 hover:shadow-lg active:scale-95"
                                        : "bg-gray-50 border-transparent opacity-50 grayscale cursor-not-allowed"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors",
                                    cat.active ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" : "bg-gray-200 text-gray-400"
                                )}>
                                    <cat.icon className="w-6 h-6" />
                                </div>
                                <span className="font-black text-sm text-gray-900 tracking-tight">{cat.name}</span>
                                {!cat.active && (
                                    <span className="absolute top-2 right-2 bg-gray-200 text-gray-500 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                                        Скоро
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                );

            case 'specs':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Модель iPhone</label>
                                <select
                                    value={state.model}
                                    onChange={(e) => updateState({ model: e.target.value })}
                                    className="w-full h-12 bg-gray-100 border-none rounded-xl px-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all appearance-none text-sm"
                                >
                                    <option value="">Выберите модель</option>
                                    {[
                                        "17 Pro Max", "17 Pro", "17 Plus", "17",
                                        "16 Pro Max", "16 Pro", "16 Plus", "16",
                                        "15 Pro Max", "15 Pro", "15 Plus", "15",
                                        "14 Pro Max", "14 Pro", "14 Plus", "14",
                                        "13 Pro Max", "13 Pro", "13 mini", "13",
                                        "12 Pro Max", "12 Pro", "12 mini", "12",
                                        "11 Pro Max", "11 Pro", "11",
                                        "XS Max", "XS", "XR", "X"
                                    ].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Память</label>
                                <div className="flex gap-2 flex-wrap">
                                    {["64", "128", "256", "512", "1TB"].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => updateState({ storage: s })}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-xs font-bold transition-all border-2",
                                                state.storage === s ? "border-blue-600 bg-blue-600 text-white" : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                                            )}
                                        >
                                            {s === "1TB" ? "1 ТБ" : s + " ГБ"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Цвет корпуса</label>
                                <div className="flex gap-2.5 flex-wrap p-1">
                                    {IPHONE_COLORS.map(c => (
                                        <button
                                            key={c.name}
                                            onClick={() => updateState({ color: c.name })}
                                            title={c.name}
                                            className={cn(
                                                "w-8 h-8 rounded-full border-2 transition-all p-0.5",
                                                state.color === c.name ? "ring-2 ring-blue-500 ring-offset-2 scale-110" : "border-transparent"
                                            )}
                                        >
                                            <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: c.hex }} />
                                        </button>
                                    ))}
                                </div>
                                {state.color && <p className="text-[10px] font-bold text-blue-600 mt-1">{state.color}</p>}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => prevStep('category')} className="flex-1 h-12 rounded-xl font-black text-xs">Назад</Button>
                            <Button
                                disabled={!state.model || !state.storage || !state.color}
                                onClick={() => nextStep('check-primary')}
                                className="flex-[2] h-12 rounded-xl font-black text-xs bg-blue-600 hover:bg-blue-700"
                            >
                                Далее
                            </Button>
                        </div>
                    </div>
                );

            case 'check-primary':
                return (
                    <div className="space-y-4">
                        <BinaryToggle
                            label="iPhone оригинальный?"
                            desc="Без замен запчастей на копии"
                            value={state.isOriginal}
                            onChange={(val) => updateState({ isOriginal: val })}
                            icon={ShieldCheck}
                        />
                        <BinaryToggle
                            label="iCloud отвязан?"
                            desc="Сброшен до заводских настроек"
                            value={state.isReset}
                            onChange={(val) => updateState({ isReset: val })}
                            icon={Undo2}
                        />
                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => prevStep('specs')} className="flex-1 h-12 rounded-xl font-black text-xs">Назад</Button>
                            <Button onClick={() => nextStep('screen-condition')} className="flex-[2] h-12 rounded-xl font-black text-xs bg-blue-600">Далее</Button>
                        </div>
                    </div>
                );

            case 'screen-condition':
            case 'body-condition':
                const isScreen = step === 'screen-condition';
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {CONDITIONS.map(c => (
                                <ConditionCard
                                    key={c.id}
                                    title={c.title}
                                    desc={c.desc}
                                    selected={(isScreen ? state.screenCondition : state.bodyCondition) === c.id}
                                    onClick={() => updateState({ [isScreen ? 'screenCondition' : 'bodyCondition']: c.id })}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" onClick={() => prevStep(isScreen ? 'check-primary' : 'screen-condition')} className="flex-1 h-12 rounded-xl font-black text-xs">Назад</Button>
                            <Button
                                disabled={!(isScreen ? state.screenCondition : state.bodyCondition)}
                                onClick={() => nextStep(isScreen ? 'body-condition' : 'rostest')}
                                className="flex-[2] h-12 rounded-xl font-black text-xs bg-blue-600"
                            >
                                Далее
                            </Button>
                        </div>
                    </div>
                );

            case 'rostest':
                return (
                    <div className="space-y-6">
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-blue-900">Что такое Ростест?</p>
                                <p className="text-[10px] text-blue-800/70 mt-0.5">Маркировка EAC или РСТ. Куплен официально в РФ.</p>
                            </div>
                        </div>
                        <BinaryToggle
                            label="iPhone Ростест (EAC)?"
                            value={state.isRostest}
                            onChange={(val) => updateState({ isRostest: val })}
                        />
                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => prevStep('body-condition')} className="flex-1 h-12 rounded-xl font-black text-xs">Назад</Button>
                            <Button onClick={() => nextStep('health')} className="flex-[2] h-12 rounded-xl font-black text-xs bg-blue-600">Далее</Button>
                        </div>
                    </div>
                );

            case 'health':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <label className="text-[11px] font-black text-gray-400 mb-2 block uppercase tracking-tighter">Состояние АКБ (%)</label>
                                <select
                                    value={state.batteryHealth}
                                    onChange={(e) => updateState({ batteryHealth: e.target.value })}
                                    className="w-full bg-white border-none rounded-xl h-10 px-3 font-bold text-blue-600 text-sm"
                                >
                                    {["100", "95-99", "90-94", "85-89", "80-84", "Ниже 80"].map(v => (
                                        <option key={v} value={v === "100" ? "100%" : v + "%"}>{v === "100" ? "100%" : v + "%"}</option>
                                    ))}
                                </select>
                            </div>
                            <BinaryToggle
                                label="Имеется полный комплект?"
                                desc="Коробка и оригинальный кабель"
                                value={state.hasFullSet}
                                onChange={(val) => updateState({ hasFullSet: val })}
                                icon={Package}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" onClick={() => prevStep('rostest')} className="flex-1 h-12 rounded-xl font-black text-xs">Назад</Button>
                            <Button onClick={() => nextStep('functional-checks')} className="flex-[2] h-12 rounded-xl font-black text-xs bg-blue-600">Далее</Button>
                        </div>
                    </div>
                );

            case 'functional-checks':
                return (
                    <div className="space-y-3">
                        <p className="text-[11px] font-black text-gray-400 uppercase ml-1">Подтвердите исправность</p>
                        <BinaryToggle
                            label="Включается и заряжается?"
                            value={state.isFunctional}
                            onChange={(val) => updateState({ isFunctional: val })}
                            icon={Activity}
                        />
                        <BinaryToggle
                            label="АКБ не вздутый?"
                            value={state.isBatterySafe}
                            onChange={(val) => updateState({ isBatterySafe: val })}
                            icon={BatteryMedium}
                        />
                        <BinaryToggle
                            label="FaceID, WiFi, Sim исправны?"
                            value={state.isHardwareOk}
                            onChange={(val) => updateState({ isHardwareOk: val })}
                            icon={Wifi}
                        />
                        <BinaryToggle
                            label="Нет ржавчины и окисления?"
                            value={state.isClean}
                            onChange={(val) => updateState({ isClean: val })}
                            icon={Droplets}
                        />
                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => prevStep('health')} className="flex-1 h-12 rounded-xl font-black text-xs">Назад</Button>
                            <Button
                                onClick={() => nextStep('history')}
                                className="flex-[2] h-12 rounded-xl font-black text-xs bg-blue-600"
                            >
                                Далее
                            </Button>
                        </div>
                    </div>
                );

            case 'history':
                return (
                    <div className="space-y-4">
                        <BinaryToggle
                            label="Был в ремонте?"
                            value={state.wasRepaired}
                            onChange={(val) => updateState({ wasRepaired: val })}
                            icon={Wrench}
                        />
                        <BinaryToggle
                            label="Есть чек о покупке?"
                            value={state.hasReceipt}
                            onChange={(val) => updateState({ hasReceipt: val })}
                            icon={Receipt}
                        />
                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => prevStep('functional-checks')} className="flex-1 h-12 rounded-xl font-black text-xs">Назад</Button>
                            <Button onClick={() => nextStep('summary')} className="flex-[2] h-12 rounded-xl font-black text-xs bg-blue-600">Далее</Button>
                        </div>
                    </div>
                );

            case 'summary':
                return (
                    <div className="space-y-6">
                        <div className="bg-gray-900 rounded-[24px] overflow-hidden p-6 text-white relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Smartphone className="w-24 h-24 rotate-12" />
                            </div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-1">Итоговое резюме</p>
                            <h3 className="text-xl font-black tracking-tight mb-4">iPhone {state.model}</h3>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-300">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: IPHONE_COLORS.find(c => c.name === state.color)?.hex }} />
                                    {state.color}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-300"><Zap className="w-3 h-3" /> {state.storage} ГБ</div>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-300"><BatteryMedium className="w-3 h-3" /> {state.batteryHealth}</div>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-300"><ShieldCheck className="w-3 h-3" /> {state.isRostest ? 'Ростест' : 'Евро/Азия'}</div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => prevStep('history')}
                                className="flex-1 h-14 rounded-2xl font-black border-2 border-gray-100"
                            >
                                <Undo2 className="w-5 h-5" />
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-[4] h-14 rounded-2xl font-black text-sm bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Получить предложение'}
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col items-center justify-center gap-4 mb-8">
                <h2 className="text-2xl font-black tracking-tight text-center text-gray-900">
                    {step === 'summary' ? 'Проверьте данные' : 'Оценка устройства'}
                </h2>

                <button
                    onClick={() => {
                        if (step === 'category') {
                            router.back();
                        } else {
                            prevStep(STEPS[STEPS.indexOf(step) - 1]);
                        }
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200 shadow-sm active:scale-95 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Назад
                </button>

                <div className="flex justify-center">
                    <div className="flex gap-1">
                        {STEPS.map((s, idx) => (
                            <div
                                key={s}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    step === s ? "w-8 bg-blue-600" : (STEPS.indexOf(step) > idx ? "w-2 bg-blue-200" : "w-1.5 bg-gray-100")
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 10, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -10, filter: 'blur(8px)' }}
                    transition={{ duration: 0.3, ease: 'circOut' }}
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
