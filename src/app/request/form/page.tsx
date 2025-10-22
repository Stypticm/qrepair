'use client';

export const dynamic = 'force-dynamic';

import { useStepNavigation } from '@/hooks/useStepNavigation';
import { useEffect } from 'react'
import { Page } from '@/components/Page';
import { useAppStore } from '@/stores/authStore';
import OptimizedPhoneSelector from '@/components/OptimizedPhoneSelector';
import { useFormData } from '@/hooks/usePersistentState';

export default function FormPage() {
    const { setCurrentStep } = useAppStore();
    const { goBack } = useStepNavigation();
    const { phoneSelection, saveToDatabase } = useFormData();

    useEffect(() => {
        setCurrentStep('form');
    }, [setCurrentStep]);

    // Автоматическое сохранение при изменении выбора телефона
    useEffect(() => {
        if (phoneSelection.state.model && phoneSelection.state.model !== 'Apple iPhone 11') {
            // Сохраняем в БД с небольшой задержкой
            const timeoutId = setTimeout(() => {
                saveToDatabase();
            }, 1000);
            
            return () => clearTimeout(timeoutId);
        }
    }, [phoneSelection.state, saveToDatabase]);

    return (
        <Page back={goBack}>
            <OptimizedPhoneSelector />
        </Page>
    );
}