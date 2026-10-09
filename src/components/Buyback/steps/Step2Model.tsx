'use client';

import { useRef, useCallback } from 'react';
import { IPHONE_SERIES, STORAGES, IPHONE_COLORS, WizardState } from '../types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, ChevronRight, Check } from 'lucide-react';

interface Step2ModelProps {
    state: WizardState;
    updateState: (updates: Partial<WizardState>) => void;
    goTo: (nextStep: number, updates?: Partial<WizardState>) => void;
    goBack: () => void;
}

export function Step2Model({ state, updateState, goTo, goBack }: Step2ModelProps) {
    const seriesList = Object.keys(IPHONE_SERIES);
    const activeSeries = state.series || seriesList[0];
    const models = IPHONE_SERIES[activeSeries] ?? [];

    const canProceed = Boolean(state.model && state.storage && state.color);

    // Pointer-based drag scroll (works in Telegram WebApp without blocking Telegram swipes)
    const scrollRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollStart = useRef(0);

    const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!scrollRef.current) return;
        isDragging.current = true;
        startX.current = e.clientX;
        scrollStart.current = scrollRef.current.scrollLeft;
        scrollRef.current.setPointerCapture(e.pointerId);
    }, []);

    const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging.current || !scrollRef.current) return;
        const delta = startX.current - e.clientX;
        scrollRef.current.scrollLeft = scrollStart.current + delta;
    }, []);

    const onPointerUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (scrollRef.current && e.deltaY !== 0) {
            e.preventDefault();
            scrollRef.current.scrollLeft += e.deltaY;
        }
    };

    return (
        <div className="space-y-5">
            {/* Series tabs with horizontal scroll */}
            <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Серия</p>
                <div
                    ref={scrollRef}
                    onWheel={handleWheel}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    className="flex gap-1.5 pb-1 w-full overflow-x-auto select-none cursor-grab active:cursor-grabbing horizontal-scroll"
                    style={{
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        scrollbarWidth: 'none',
                        WebkitOverflowScrolling: 'touch',
                    } as React.CSSProperties}
                >
                    {seriesList.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => updateState({ series: s, model: '' })}
                            className={cn(
                                'shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer pointer-events-auto',
                                activeSeries === s
                                    ? 'bg-accent text-primary-foreground border-accent shadow-md'
                                    : 'bg-surface-elevated border-border text-muted hover:border-accent/40',
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Model tiles */}
            <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Модель</p>
                <div className="grid grid-cols-2 gap-2">
                    {models.map((m) => {
                        const isSelected = state.model === m;
                        return (
                            <button
                                key={m}
                                type="button"
                                onClick={() => updateState({ model: m })}
                                className={cn(
                                    'p-3 rounded-xl text-xs font-black text-left transition-all border cursor-pointer flex items-center justify-between',
                                    isSelected
                                        ? 'border-accent bg-accent/15 dark:bg-accent/20 text-accent-deep dark:text-accent shadow-sm'
                                        : 'border-border bg-surface-elevated text-foreground hover:border-accent/40',
                                )}
                            >
                                <span className="truncate">{m}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-accent" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Storage options */}
            <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Память</p>
                <div className="flex gap-1.5 flex-wrap">
                    {STORAGES.map((st) => {
                        const isSelected = state.storage === st;
                        return (
                            <button
                                key={st}
                                type="button"
                                onClick={() => updateState({ storage: st })}
                                className={cn(
                                    'px-3.5 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer',
                                    isSelected
                                        ? 'bg-accent text-primary-foreground border-accent shadow-sm'
                                        : 'bg-surface-elevated border-border text-muted hover:border-accent/40 hover:text-foreground',
                                )}
                            >
                                {st === '1TB' ? '1 ТБ' : `${st} ГБ`}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Color options */}
            <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Цвет</p>
                <div className="grid grid-cols-3 gap-1.5">
                    {IPHONE_COLORS.map((col) => {
                        const isSelected = state.color === col.name;
                        return (
                            <button
                                key={col.name}
                                type="button"
                                onClick={() => updateState({ color: col.name })}
                                className={cn(
                                    'p-2 rounded-xl text-left transition-all border flex items-center gap-2 cursor-pointer',
                                    isSelected
                                        ? 'border-accent bg-accent/15 dark:bg-accent/20 shadow-sm'
                                        : 'border-border bg-surface-elevated hover:border-accent/40',
                                )}
                            >
                                <span
                                    className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 shrink-0"
                                    style={{ backgroundColor: col.hex }}
                                />
                                <span className="text-[11px] font-black text-foreground truncate">{col.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={goBack} className="flex-1 h-12 rounded-xl font-black text-xs cursor-pointer">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Назад
                </Button>
                <Button
                    disabled={!canProceed}
                    onClick={() => goTo(3)}
                    className="flex-[2] h-12 rounded-xl font-black text-xs bg-accent hover:bg-accent-hover text-primary-foreground shadow-lg shadow-accent/20 transition-all disabled:opacity-40 cursor-pointer"
                >
                    Далее <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
