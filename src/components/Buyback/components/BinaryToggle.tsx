'use client';

import { LucideIcon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BinaryToggle = ({
    label,
    value,
    onChange,
    desc,
    icon: Icon,
}: {
    label: string;
    value: boolean;
    onChange: (val: boolean) => void;
    desc?: string;
    icon?: LucideIcon;
}) => (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated border border-border">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
            {Icon && (
                <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-muted" />
                </div>
            )}
            <div className="min-w-0">
                <p className="text-xs font-bold text-foreground leading-tight truncate">{label}</p>
                {desc && <p className="text-[10px] text-muted leading-tight truncate">{desc}</p>}
            </div>
        </div>
        <div className="flex gap-1 shrink-0">
            <button
                type="button"
                onClick={() => onChange(true)}
                className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer',
                    value
                        ? 'bg-accent text-primary-foreground shadow-sm'
                        : 'bg-surface text-muted hover:bg-input',
                )}
            >
                <Check className="w-3 h-3 stroke-[3]" /> Да
            </button>
            <button
                type="button"
                onClick={() => onChange(false)}
                className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer',
                    !value
                        ? 'bg-destructive text-destructive-foreground shadow-sm'
                        : 'bg-surface text-muted hover:bg-input',
                )}
            >
                <X className="w-3 h-3 stroke-[3]" /> Нет
            </button>
        </div>
    </div>
);
