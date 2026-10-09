'use client';

import { BATTERY_OPTIONS, WizardState } from '../types';
import { Button } from '@/components/ui/button';
import { BinaryToggle } from '../components/BinaryToggle';
import {
    ShieldCheck,
    Package,
    Activity,
    BatteryMedium,
    Wifi,
    Droplets,
    Wrench,
    Receipt,
    ArrowLeft,
    ChevronRight,
} from 'lucide-react';

interface Step5InspectionProps {
    state: WizardState;
    updateState: (updates: Partial<WizardState>) => void;
    goTo: (nextStep: number, updates?: Partial<WizardState>) => void;
    goBack: () => void;
}

export function Step5Inspection({ state, updateState, goTo, goBack }: Step5InspectionProps) {
    return (
        <div className="space-y-2 pb-2">
            {/* Battery dropdown */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated border border-border">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center">
                        <BatteryMedium className="w-3.5 h-3.5 text-muted" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Состояние аккумулятора</span>
                </div>
                <select
                    value={state.batteryHealth}
                    onChange={(e) => updateState({ batteryHealth: e.target.value })}
                    className="text-xs font-black bg-surface border border-border rounded-lg px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                >
                    {BATTERY_OPTIONS.map((v) => (
                        <option key={v} value={v}>
                            {v}
                        </option>
                    ))}
                </select>
            </div>

            <BinaryToggle
                label="Ростест (EAC/РСТ)?"
                desc="Куплен официально в РФ"
                value={state.isRostest}
                onChange={(val) => updateState({ isRostest: val })}
                icon={ShieldCheck}
            />
            <BinaryToggle
                label="Полный комплект?"
                desc="Коробка и оригинальный кабель"
                value={state.hasFullSet}
                onChange={(val) => updateState({ hasFullSet: val })}
                icon={Package}
            />
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

            <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={goBack} className="flex-1 h-12 rounded-xl font-black text-xs cursor-pointer">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Назад
                </Button>
                <Button
                    onClick={() => goTo(6)}
                    className="flex-[2] h-12 rounded-xl font-black text-xs bg-accent hover:bg-accent-hover text-primary-foreground shadow-lg shadow-accent/20 cursor-pointer"
                >
                    Далее <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
