'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 5;

interface StepInfo {
    step: number;
    title: string;
    subtitle: string;
    backUrl: string;
}

function getStepInfo(pathname: string): StepInfo | null {
    if (pathname.includes('/delivery')) {
        return {
            step: 5,
            title: 'Оформление заявки',
            subtitle: 'Способ передачи и контакты',
            backUrl: '/repair/estimate',
        };
    }
    if (pathname.includes('/estimate')) {
        return {
            step: 4,
            title: 'Оценка стоимости',
            subtitle: 'Предварительный расчёт ремонта',
            backUrl: '/repair/issue',
        };
    }
    if (pathname.includes('/issue')) {
        return {
            step: 3,
            title: 'Опишите проблему',
            subtitle: 'Детали и фотографии поломки',
            backUrl: '/repair/device',
        };
    }
    if (pathname.includes('/device')) {
        return {
            step: 2,
            title: 'Какое устройство?',
            subtitle: 'Выберите серию и модель iPhone',
            backUrl: '/repair',
        };
    }
    if (pathname.includes('/ai-diagnosis')) {
        return {
            step: 4,
            title: 'AI Диагностика',
            subtitle: 'Определение неполадки нейросетью',
            backUrl: '/repair/estimate',
        };
    }
    if (pathname.includes('/status')) {
        return null;
    }
    // По умолчанию /repair
    return {
        step: 1,
        title: 'Что сломалось?',
        subtitle: 'Выберите одну или несколько неисправностей',
        backUrl: '/',
    };
}

export function RepairHeader() {
    const router = useRouter();
    const pathname = usePathname();

    const stepInfo = getStepInfo(pathname || '');

    // Управление системной кнопкой "Назад" в Telegram WebApp
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.BackButton) return;

        if (stepInfo && stepInfo.step > 1) {
            tg.BackButton.show();
            const handleTelegramBack = () => {
                router.push(stepInfo.backUrl);
            };
            tg.BackButton.onClick(handleTelegramBack);
            return () => {
                tg.BackButton.offClick(handleTelegramBack);
            };
        } else {
            tg.BackButton.hide();
        }
    }, [stepInfo, router]);

    // На странице статуса не рендерим шапку шагов
    if (!stepInfo) {
        return null;
    }

    const { step, title, subtitle } = stepInfo;

    return (
        <div
            className="w-full max-w-md mx-auto px-4 pb-3 select-none"
            style={{ paddingTop: 'max(40px, calc(env(safe-area-inset-top) + 22px))' }}
        >
            <div className="space-y-3">
                {/* Заголовок по центру без кнопки в углу, чтобы не конфликтовать с системными кнопками Telegram */}
                <div className="text-center space-y-1">
                    <h1 className="text-xl font-black tracking-tight text-foreground leading-tight">
                        {title}
                    </h1>
                    <p className="text-xs text-muted">
                        {subtitle}
                    </p>
                </div>

                {/* Полоски шагов (прогресс) */}
                <div className="flex gap-1.5 pt-1">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
                        const n = i + 1;
                        return (
                            <div
                                key={n}
                                className={cn(
                                    'h-1.5 rounded-full transition-all duration-300 flex-1',
                                    n < step
                                        ? 'bg-accent/60'
                                        : n === step
                                        ? 'bg-accent'
                                        : 'bg-border/60 dark:bg-white/10',
                                )}
                            />
                        );
                    })}
                </div>

                {/* Текст шага */}
                <div className="flex items-center justify-between text-[11px] font-bold text-muted">
                    <span>Шаг {step} из {TOTAL_STEPS}</span>
                    <span className="text-accent-deep dark:text-accent font-semibold">
                        {step === 1 && 'Выбор поломок'}
                        {step === 2 && 'Устройство'}
                        {step === 3 && 'Описание'}
                        {step === 4 && 'Стоимость'}
                        {step === 5 && 'Оформление'}
                    </span>
                </div>
            </div>
        </div>
    );
}
