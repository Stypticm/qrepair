'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSignal, initDataState as _initDataState } from '@telegram-apps/sdk-react';
import { ConditionStatus, FormState } from '@/core/lib/interfaces';

const StartFormContext = createContext<FormState | null>(null);

export function StartFormProvider({ children }: { children: ReactNode }) {
    const initDataState = useSignal(_initDataState);

    const [username, setUsername] = useState<string | null>(null);
    const [telegramId, setTelegramId] = useState<string | null>(null);
    const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);

    const [modelname, setModel] = useState<string>('Apple iPhone 11');
    const [condition, setCondition] = useState<ConditionStatus[]>(['display', 'body']);
    const [photoUrls, setPhotoUrls] = useState<(string | null)[]>(new Array(6).fill(null));
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [comment, setComment] = useState<string>('');
    const [contractUrl, setContractUrl] = useState<string | null>(null);
    const [imei, setImei] = useState<string | null>(null);
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
                modelname,
                condition,
                photoUrls,
                videoUrl,
                telegramId,
                userPhotoUrl,
                comment,
                contractUrl,
                imei,
                onNext,
                setOnNext,
                setVideoUrl,
                setPhotoUrls,
                setTelegramId,
                setComment,
                setModel,
                setCondition,
                setContractUrl,
                setImei,
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
