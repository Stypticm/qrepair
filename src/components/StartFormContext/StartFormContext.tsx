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

    const [brandname, setBrand] = useState<string | null>('Apple iPhone 11');
    const [modelname, setModel] = useState<string>('');
    const [brandModelText, setBrandModelText] = useState<string>('');
    const [crash, setCrash] = useState<string[]>([]);
    const [crashDescription, setCrashDescription] = useState<string>('');
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);
    const [onNext, setOnNext] = useState<(() => Promise<void>) | undefined>(undefined);

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
                brandname,
                modelname,
                brandModelText,
                crash,
                crashDescription,
                photoUrls,
                telegramId,
                userPhotoUrl,
                onNext,
                setOnNext,
                setCrash,
                setPhotoUrls,
                setTelegramId,
                setBrand,
                setModel,
                setCrashDescription,
                setBrandModelText,
                setUsername,
                setUserPhotoUrl
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
