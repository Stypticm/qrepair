'use client';

import { WizardState } from '../types';
import { Button } from '@/components/ui/button';
import { BinaryToggle } from '../components/BinaryToggle';
import { ShieldCheck, Zap, ArrowLeft, ChevronRight } from 'lucide-react';

interface Step3CheckProps {
    state: WizardState;
    updateState: (updates: Partial<WizardState>) => void;
    goTo: (nextStep: number, updates?: Partial<WizardState>) => void;
    goBack: () => void;
}

export function Step3Check({ state, updateState, goTo, goBack }: Step3CheckProps) {
    return (
        <div className="space-y-4">
            <BinaryToggle
                label="Устройство оригинальное?"
                desc="Не копия и не восстановленный без лицензии"
                value={state.isOriginal}
                onChange={(val) => updateState({ isOriginal: val })}
                icon={ShieldCheck}
            />

            <BinaryToggle
                label="iCloud / аккаунт отвязан?"
                desc="Локатор отключен, пароли сброшены"
                value={state.isReset}
                onChange={(val) => updateState({ isReset: val })}
                icon={Zap}
            />

            <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={goBack} className="flex-1 h-12 rounded-xl font-black text-xs cursor-pointer">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Назад
                </Button>
                <Button
                    onClick={() => goTo(4)}
                    className="flex-[2] h-12 rounded-xl font-black text-xs bg-accent hover:bg-accent-hover text-primary-foreground shadow-lg shadow-accent/20 cursor-pointer"
                >
                    Далее <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
