'use client';

import { CONDITIONS, IPHONE_COLORS, WizardState } from '../types';
import { Button } from '@/components/ui/button';
import { SummaryRow } from '../components/SummaryRow';
import { Smartphone, ArrowLeft, Loader2, Phone } from 'lucide-react';

interface Step6SummaryProps {
    state: WizardState;
    isSubmitting: boolean;
    handleSubmit: () => void;
    goBack: () => void;
    updateState: (updates: Partial<WizardState>) => void;
}

export function Step6Summary({ state, isSubmitting, handleSubmit, goBack, updateState }: Step6SummaryProps) {
    const colorHex = IPHONE_COLORS.find((c) => c.name === state.color)?.hex;
    const conditionMeta = CONDITIONS.find((c) => c.id === state.bodyCondition);

    const handleContactChange = (value: string) => {
        let formatted = value;
        // Автодобавление @ если похоже на Telegram-никнейм
        if (/^[a-zA-Z]/.test(value) && !value.startsWith('@') && !value.includes(' ')) {
            formatted = '@' + value;
        }
        updateState({ contact: formatted });
    };

    return (
        <div className="space-y-3">
            <div className="bg-gray-950 rounded-2xl overflow-hidden p-4 text-white relative border border-white/5">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Smartphone className="w-20 h-20 rotate-12" />
                </div>

                {/* Header */}
                <div className="flex items-center gap-2.5 mb-3">
                    {colorHex && (
                        <div
                            className="w-7 h-7 rounded-full border border-white/20 shadow shrink-0"
                            style={{ backgroundColor: colorHex }}
                        />
                    )}
                    <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em]">Итоговое резюме</p>
                        <h3 className="text-lg font-black tracking-tight leading-tight truncate">
                            {state.category} {state.model}
                        </h3>
                    </div>
                </div>

                {/* Two-column grid for compact display */}
                <div className="grid grid-cols-2 gap-x-3">
                    <SummaryRow label="Серия" value={state.series || '—'} />
                    <SummaryRow
                        label="Память"
                        value={state.storage === '1TB' ? '1 ТБ' : state.storage ? `${state.storage} ГБ` : '—'}
                    />
                    <SummaryRow label="Вид" value={conditionMeta ? `${conditionMeta.emoji} ${conditionMeta.title}` : '—'} />
                    <SummaryRow label="АКБ" value={state.batteryHealth} />
                    <SummaryRow label="Ростест" value={state.isRostest ? '✅' : '❌'} />
                    <SummaryRow label="Оригинал" value={state.isOriginal ? '✅' : '❌'} />
                    <SummaryRow label="iCloud" value={state.isReset ? 'Отвязан ✅' : 'Привязан ❌'} />
                    <SummaryRow label="Комплект" value={state.hasFullSet ? '✅' : '❌'} />
                    <SummaryRow label="Ремонт" value={state.wasRepaired ? 'Да' : 'Нет'} />
                    <SummaryRow label="Чек" value={state.hasReceipt ? 'Есть' : 'Нет'} />
                </div>
            </div>

            {/* Контакт для связи */}
            <div className="bg-surface-elevated rounded-2xl border border-border p-4 space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                    <Phone className="w-3.5 h-3.5" />
                    Контакт для связи
                </label>
                <input
                    type="text"
                    placeholder="+7 (999) 000-00-00 или @username"
                    value={state.contact}
                    onChange={(e) => handleContactChange(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground placeholder:text-muted/60"
                />
                <p className="text-[10px] text-muted leading-relaxed">
                    Наш менеджер свяжется с вами для уточнения деталей и финальной цены.
                </p>
            </div>

            <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={goBack} className="flex-1 h-14 rounded-2xl font-black border-2 border-border cursor-pointer">
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    Назад
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-[3] h-14 rounded-2xl font-black text-sm bg-accent hover:bg-accent-hover text-primary-foreground shadow-xl shadow-accent/30 transition-all cursor-pointer"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin w-5 h-5 mr-2" />
                            Отправка...
                        </>
                    ) : (
                        'Получить предложение'
                    )}
                </Button>
            </div>
        </div>
    );
}
