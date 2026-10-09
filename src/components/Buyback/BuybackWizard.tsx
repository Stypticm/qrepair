'use client';

import { useAppStore } from '@/stores/authStore';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState, useRef, Suspense, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import {
    WizardState,
    INITIAL_STATE,
    STEP_COUNT,
    STEP_META,
    serializeState,
    parseFromParams,
} from './types';

import { Step1Category } from './steps/Step1Category';
import { Step2Model } from './steps/Step2Model';
import { Step3Check } from './steps/Step3Check';
import { Step4Condition } from './steps/Step4Condition';
import { Step5Inspection } from './steps/Step5Inspection';
import { Step6Summary } from './steps/Step6Summary';

const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

function BuybackWizardInner({ onComplete }: { onComplete?: () => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const rawParams = useSearchParams();
    const { telegramId } = useAppStore();

    const params = rawParams ?? new URLSearchParams();
    const parsed = parseFromParams(params);

    const [step, setStep] = useState<number>(parsed.step);
    const [state, setState] = useState<WizardState>(parsed.state);
    const [direction, setDirection] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isGoingBack = useRef(false);
    const urlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── URL sync (debounced) ──────────────────────────────────────────────
    const pushUrl = useCallback((nextStep: number, nextState: WizardState) => {
        if (urlTimer.current) clearTimeout(urlTimer.current);
        urlTimer.current = setTimeout(() => {
            const qs = serializeState(nextStep, nextState).toString();
            router.replace(`${pathname}?${qs}`, { scroll: false });
        }, 80);
    }, [router, pathname]);

    // ── Navigation ────────────────────────────────────────────────────────
    const goTo = useCallback((nextStep: number, updates?: Partial<WizardState>) => {
        const nextState = updates ? { ...state, ...updates } : state;
        setDirection(nextStep > step ? 1 : -1);
        setStep(nextStep);
        setState(nextState);
        pushUrl(nextStep, nextState);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step, state, pushUrl]);

    const goBack = useCallback(() => {
        if (step <= 1) {
            router.push('/');
            return;
        }
        isGoingBack.current = true;
        goTo(step - 1);
        setTimeout(() => { isGoingBack.current = false; }, 600);
    }, [step, goTo, router]);

    // ── Telegram BackButton Sync ──────────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.BackButton) return;

        if (step > 1) {
            tg.BackButton.show();
            const handleTgBack = () => goBack();
            tg.BackButton.onClick(handleTgBack);
            return () => {
                tg.BackButton.offClick(handleTgBack);
            };
        } else {
            tg.BackButton.hide();
        }
    }, [step, goBack]);

    // ── State update without navigation ──────────────────────────────────
    const updateState = useCallback((updates: Partial<WizardState>) => {
        setState(prev => {
            const next = { ...prev, ...updates };
            pushUrl(step, next);
            return next;
        });
    }, [step, pushUrl]);

    // ── Auto-advance after tile click ─────────────────────────────────────
    const autoAdvance = useCallback((nextStep: number, updates: Partial<WizardState>) => {
        const merged = { ...state, ...updates };
        setState(merged);
        pushUrl(step, merged);
        if (isGoingBack.current) return;
        setTimeout(() => {
            if (!isGoingBack.current) {
                setDirection(1);
                setStep(nextStep);
                setState(merged);
                pushUrl(nextStep, merged);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 200);
    }, [state, step, pushUrl]);

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/trade-in/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-id': telegramId || '',
                },
                body: JSON.stringify(state),
            });

            if (res.ok) {
                const evalData = await res.json();
                if (evalData?.id && typeof window !== 'undefined') {
                    try {
                        const existing = JSON.parse(localStorage.getItem('qoqos_guest_trade_in') || '[]');
                        const updated = Array.from(new Set([evalData.id, ...existing]));
                        localStorage.setItem('qoqos_guest_trade_in', JSON.stringify(updated));
                    } catch (e) {
                        // ignore storage errors
                    }
                }
                // Сбрасываем состояние и URL query параметры после успешной отправки
                setState(INITIAL_STATE);
                setStep(1);
                router.replace(pathname, { scroll: false });

                toast.success('Заявка на оценку принята!', { duration: 3000 });
                setTimeout(() => {
                    onComplete?.();
                    router.push('/');
                }, 1500);
            } else {
                toast.error('Ошибка при сохранении заявки');
            }
        } catch {
            toast.error('Ошибка сети при отправке');
        } finally {
            setIsSubmitting(false);
        }
    };

    const meta = STEP_META[step] ?? { title: 'Оценка устройства', subtitle: '' };

    const renderCurrentStep = () => {
        switch (step) {
            case 1:
                return <Step1Category state={state} autoAdvance={autoAdvance} />;
            case 2:
                return <Step2Model state={state} updateState={updateState} goTo={goTo} goBack={goBack} />;
            case 3:
                return <Step3Check state={state} updateState={updateState} goTo={goTo} goBack={goBack} />;
            case 4:
                return <Step4Condition state={state} autoAdvance={autoAdvance} goTo={goTo} goBack={goBack} />;
            case 5:
                return <Step5Inspection state={state} updateState={updateState} goTo={goTo} goBack={goBack} />;
            case 6:
                return <Step6Summary state={state} isSubmitting={isSubmitting} handleSubmit={handleSubmit} goBack={goBack} updateState={updateState} />;
            default:
                return <Step1Category state={state} autoAdvance={autoAdvance} />;
        }
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-6 space-y-3 select-none">
                <div className="text-center space-y-1">
                    <h2 className="text-xl font-black tracking-tight text-foreground leading-tight">{meta.title}</h2>
                    <p className="text-xs text-muted truncate">{meta.subtitle}</p>
                </div>

                {/* Progress bars */}
                <div className="flex gap-1.5 pt-1">
                    {Array.from({ length: STEP_COUNT }).map((_, i) => {
                        const n = i + 1;
                        return (
                            <div
                                key={n}
                                className={cn(
                                    'h-1.5 rounded-full transition-all duration-300 flex-1',
                                    n < step ? 'bg-accent/60' : n === step ? 'bg-accent' : 'bg-border/60 dark:bg-white/10',
                                )}
                            />
                        );
                    })}
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-muted">
                    <span>Шаг {step} из {STEP_COUNT}</span>
                    <span className="text-accent-deep dark:text-accent font-semibold">{meta.title}</span>
                </div>
            </div>

            {/* Animated step content */}
            <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                    key={step}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                >
                    {renderCurrentStep()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export function BuybackWizard({ onComplete }: { onComplete?: () => void }) {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="animate-spin w-8 h-8 text-accent" />
                </div>
            }
        >
            <BuybackWizardInner onComplete={onComplete} />
        </Suspense>
    );
}
