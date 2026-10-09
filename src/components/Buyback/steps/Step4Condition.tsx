'use client';

import { CONDITIONS, ConditionGrade, WizardState } from '../types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, ChevronRight, Check } from 'lucide-react';

interface Step4ConditionProps {
    state: WizardState;
    autoAdvance: (nextStep: number, updates: Partial<WizardState>) => void;
    goTo: (nextStep: number, updates?: Partial<WizardState>) => void;
    goBack: () => void;
}

export function Step4Condition({ state, autoAdvance, goTo, goBack }: Step4ConditionProps) {
    return (
        <div className="space-y-3">
            <div className="space-y-2">
                {CONDITIONS.map((c) => {
                    const isSelected = state.bodyCondition === c.id;
                    return (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => autoAdvance(5, { bodyCondition: c.id as ConditionGrade })}
                            className={cn(
                                'w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 select-none cursor-pointer active:scale-[0.99]',
                                isSelected
                                    ? 'border-accent bg-accent/15 dark:bg-accent/20 shadow-md ring-2 ring-accent/30'
                                    : 'border-border bg-surface-elevated hover:border-accent/40 hover:bg-surface',
                            )}
                        >
                            <span className="text-2xl leading-none mt-0.5 shrink-0">{c.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-foreground">{c.title}</p>
                                <p className="text-xs text-muted leading-relaxed mt-0.5">{c.desc}</p>
                            </div>
                            {isSelected && <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />}
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={goBack} className="flex-1 h-12 rounded-xl font-black text-xs cursor-pointer">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Назад
                </Button>
                <Button
                    disabled={!state.bodyCondition}
                    onClick={() => goTo(5)}
                    className="flex-[2] h-12 rounded-xl font-black text-xs bg-accent hover:bg-accent-hover text-primary-foreground shadow-lg shadow-accent/20 transition-all disabled:opacity-40 cursor-pointer"
                >
                    Далее <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
