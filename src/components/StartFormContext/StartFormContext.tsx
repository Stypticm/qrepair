'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSignal, initDataState as _initDataState } from '@telegram-apps/sdk-react';
import { FormState } from '@/core/lib/interfaces';

const StartFormContext = createContext<FormState | null>(null);

export function StartFormProvider({ children }: { children: ReactNode }) {
    const initDataState = useSignal(_initDataState);

    const [username, setUsername] = useState<string | null>(null);
    const [telegramId, setTelegramId] = useState<string | null>(null);
    const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);

    const [modelname, setModel] = useState<string>('Apple iPhone 11');
    const [comment, setComment] = useState<string>('');
    const [imei, setImei] = useState<string | null>(null);
    const [answers, setAnswers] = useState<number[]>([]);
    const [showQuestionsSuccess, setShowQuestionsSuccess] = useState(false);
    const [price, setPrice] = useState<number | null>(null);
    const [onNext, setOnNext] = useState<(() => Promise<void>) | undefined>(undefined);
    
    // Состояния устройства
    const [deviceConditions, setDeviceConditions] = useState<{
        front: string | null;
        back: string | null;
        side: string | null;
    }>({
        front: null,
        back: null,
        side: null
    });

    // Функция для сброса всех состояний
    const resetAllStates = () => {
        setModel('Apple iPhone 11');
        setComment('');
        setImei(null);
        setAnswers([]);
        setShowQuestionsSuccess(false);
        setPrice(null);
        setOnNext(undefined);
        setDeviceConditions({
            front: null,
            back: null,
            side: null
        });
    };

    useEffect(() => {
        if (initDataState?.user) {
            setUsername(initDataState.user.first_name ?? null);
            setTelegramId(String(initDataState.user.id));
            setUserPhotoUrl(initDataState.user.photo_url ?? null);
        }
    }, [initDataState]);

    return (
        <StartFormContext.Provider
            value={{
                username,
                modelname,
                telegramId,
                userPhotoUrl,
                comment,
                imei,
                answers,
                price,
                showQuestionsSuccess,
                onNext,
                deviceConditions,
                setOnNext,
                setTelegramId,
                setComment,
                setModel,
                setImei,
                setUsername,
                setUserPhotoUrl,
                setAnswers,
                setShowQuestionsSuccess,
                setPrice,
                setDeviceConditions,
                resetAllStates
            }}
        >
            {children}
        </StartFormContext.Provider>
    );
}

export function useStartForm() {
    const context = useContext(StartFormContext);
    if (!context) {
        throw new Error('useStartForm must be used within a StartFormProvider');
    }
    return context;
}
