'use client';

import { CATEGORIES, WizardState } from '../types';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface Step1CategoryProps {
    state: WizardState;
    autoAdvance: (nextStep: number, updates: Partial<WizardState>) => void;
}

export function Step1Category({ state, autoAdvance }: Step1CategoryProps) {
    return (
        <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = state.category === cat.name;
                return (
                    <button
                        key={cat.id}
                        type="button"
                        disabled={!cat.active}
                        onClick={() => {
                            if (!cat.active) return;
                            autoAdvance(2, { category: cat.name });
                        }}
                        className={cn(
                            'relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all gap-2 text-center select-none',
                            cat.active ? 'cursor-pointer active:scale-95' : 'opacity-40 cursor-not-allowed',
                            isSelected
                                ? 'border-accent bg-accent/15 dark:bg-accent/20 shadow-md ring-2 ring-accent/30'
                                : 'border-border bg-surface-elevated hover:border-accent/40',
                        )}
                    >
                        {!cat.active && (
                            <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-surface border border-border text-muted">
                                Скоро
                            </span>
                        )}
                        <div
                            className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                                isSelected ? 'bg-accent text-primary-foreground' : 'bg-surface text-muted',
                            )}
                        >
                            <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black tracking-tight text-foreground">{cat.name}</span>
                        {cat.active && (
                            <ChevronRight
                                className={cn(
                                    'w-3.5 h-3.5 transition-colors',
                                    isSelected ? 'text-accent-deep dark:text-accent' : 'text-muted/40',
                                )}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
