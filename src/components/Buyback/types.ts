import { Smartphone, Tablet, Laptop, Watch, LucideIcon } from 'lucide-react';

export type ConditionGrade = 'perfect' | 'good' | 'worn' | 'bad' | '';

export interface WizardState {
    category: string;
    series: string;
    model: string;
    storage: string;
    color: string;
    isOriginal: boolean;
    isReset: boolean;
    bodyCondition: ConditionGrade;
    isRostest: boolean;
    batteryHealth: string;
    hasFullSet: boolean;
    isFunctional: boolean;
    isBatterySafe: boolean;
    isHardwareOk: boolean;
    isClean: boolean;
    wasRepaired: boolean;
    hasReceipt: boolean;
    contact: string;
}

export const INITIAL_STATE: WizardState = {
    category: 'iPhone',
    series: '',
    model: '',
    storage: '',
    color: '',
    isOriginal: true,
    isReset: true,
    bodyCondition: '',
    isRostest: true,
    batteryHealth: '100%',
    hasFullSet: true,
    isFunctional: true,
    isBatterySafe: true,
    isHardwareOk: true,
    isClean: true,
    wasRepaired: false,
    hasReceipt: false,
    contact: '',
};

export const STEP_COUNT = 6;

export interface CategoryItem {
    id: string;
    name: string;
    icon: LucideIcon;
    active: boolean;
}

export const CATEGORIES: CategoryItem[] = [
    { id: 'iPhone', name: 'iPhone', icon: Smartphone, active: true },
    { id: 'iPad', name: 'iPad', icon: Tablet, active: false },
    { id: 'Mac', name: 'Mac', icon: Laptop, active: false },
    { id: 'Apple Watch', name: 'Apple Watch', icon: Watch, active: false },
];

export const IPHONE_SERIES: Record<string, string[]> = {
    'iPhone 17': ['17 Pro Max', '17 Pro', '17 Plus', '17'],
    'iPhone 16': ['16 Pro Max', '16 Pro', '16 Plus', '16'],
    'iPhone 15': ['15 Pro Max', '15 Pro', '15 Plus', '15'],
    'iPhone 14': ['14 Pro Max', '14 Pro', '14 Plus', '14'],
    'iPhone 13': ['13 Pro Max', '13 Pro', '13 mini', '13'],
    'iPhone 12': ['12 Pro Max', '12 Pro', '12 mini', '12'],
    'iPhone 11': ['11 Pro Max', '11 Pro', '11'],
    'Другие': ['XS Max', 'XS', 'XR', 'X', 'SE (3rd gen)', 'SE (2nd gen)'],
};

export const STORAGES = ['64', '128', '256', '512', '1TB'];

export const IPHONE_COLORS = [
    { name: 'Natural Titanium', hex: '#bab6b3' },
    { name: 'Desert Titanium', hex: '#b29f8f' },
    { name: 'Black Titanium', hex: '#35393b' },
    { name: 'White Titanium', hex: '#f2f1ed' },
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

export const CONDITIONS = [
    { id: 'perfect', title: 'Безупречный', emoji: '✨', desc: 'Нет царапин. Как новый. Без дефектных пикселей.' },
    { id: 'good', title: 'Хороший', emoji: '👍', desc: 'Лёгкие следы износа, незаметные с расстояния. Без трещин.' },
    { id: 'worn', title: 'Изношен', emoji: '😐', desc: 'Видимые царапины и вмятины на корпусе.' },
    { id: 'bad', title: 'Плохое', emoji: '💔', desc: 'Трещины, сколы или дефекты матрицы (битые пиксели, полосы).' },
];

export const BATTERY_OPTIONS = ['100%', '95-99%', '90-94%', '85-89%', '80-84%', 'Ниже 80%'];

export const STEP_META: Record<number, { title: string; subtitle: string }> = {
    1: { title: 'Что оцениваем?', subtitle: 'Выберите тип устройства' },
    2: { title: 'Укажите модель', subtitle: 'Серия, модель, память и цвет' },
    3: { title: 'Проверка', subtitle: 'Оригинальность и iCloud' },
    4: { title: 'Внешнее состояние', subtitle: 'Оцените корпус и экран' },
    5: { title: 'Исправность', subtitle: 'Чеклист функций и комплект' },
    6: { title: 'Проверьте данные', subtitle: 'Всё верно? Готово к отправке' },
};

export function serializeState(step: number, s: WizardState): URLSearchParams {
    const p = new URLSearchParams();
    p.set('step', String(step));
    p.set('category', s.category);
    p.set('series', s.series);
    p.set('model', s.model);
    p.set('storage', s.storage);
    p.set('color', s.color);
    p.set('isOriginal', String(s.isOriginal));
    p.set('isReset', String(s.isReset));
    p.set('bodyCondition', s.bodyCondition);
    p.set('isRostest', String(s.isRostest));
    p.set('batteryHealth', s.batteryHealth);
    p.set('hasFullSet', String(s.hasFullSet));
    p.set('isFunctional', String(s.isFunctional));
    p.set('isBatterySafe', String(s.isBatterySafe));
    p.set('isHardwareOk', String(s.isHardwareOk));
    p.set('isClean', String(s.isClean));
    p.set('wasRepaired', String(s.wasRepaired));
    p.set('hasReceipt', String(s.hasReceipt));
    p.set('contact', s.contact || '');
    return p;
}

export function parseFromParams(params: URLSearchParams): { step: number; state: WizardState } {
    const rawStep = Number(params.get('step'));
    const step = rawStep >= 1 && rawStep <= STEP_COUNT ? rawStep : 1;

    const bool = (key: string, fallback: boolean): boolean => {
        const v = params.get(key);
        if (v === null) return fallback;
        return v === 'true';
    };

    const str = (key: string, fallback: string): string => params.get(key) ?? fallback;

    const rawGrade = params.get('bodyCondition') as ConditionGrade;
    const bodyCondition: ConditionGrade =
        rawGrade === 'perfect' || rawGrade === 'good' || rawGrade === 'worn' || rawGrade === 'bad'
            ? rawGrade
            : INITIAL_STATE.bodyCondition;

    return {
        step,
        state: {
            category: str('category', INITIAL_STATE.category),
            series: str('series', INITIAL_STATE.series),
            model: str('model', INITIAL_STATE.model),
            storage: str('storage', INITIAL_STATE.storage),
            color: str('color', INITIAL_STATE.color),
            isOriginal: bool('isOriginal', INITIAL_STATE.isOriginal),
            isReset: bool('isReset', INITIAL_STATE.isReset),
            bodyCondition,
            isRostest: bool('isRostest', INITIAL_STATE.isRostest),
            batteryHealth: str('batteryHealth', INITIAL_STATE.batteryHealth),
            hasFullSet: bool('hasFullSet', INITIAL_STATE.hasFullSet),
            isFunctional: bool('isFunctional', INITIAL_STATE.isFunctional),
            isBatterySafe: bool('isBatterySafe', INITIAL_STATE.isBatterySafe),
            isHardwareOk: bool('isHardwareOk', INITIAL_STATE.isHardwareOk),
            isClean: bool('isClean', INITIAL_STATE.isClean),
            wasRepaired: bool('wasRepaired', INITIAL_STATE.wasRepaired),
            hasReceipt: bool('hasReceipt', INITIAL_STATE.hasReceipt),
            contact: str('contact', INITIAL_STATE.contact),
        },
    };
}
