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
    const [photoUrls, setPhotoUrls] = useState<(string | null)[]>(new Array(6).fill(null));
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [comment, setComment] = useState<string>('');
    const [contractUrl, setContractUrl] = useState<string | null>(null);
    const [imei, setImei] = useState<string | null>(null);
    const [answers, setAnswers] = useState<number[]>(new Array(8).fill(0));
    const [showQuestionsSuccess, setShowQuestionsSuccess] = useState(false);
    const [price, setPrice] = useState<number | null>(null);
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
                photoUrls,
                videoUrl,
                telegramId,
                userPhotoUrl,
                comment,
                contractUrl,
                imei,
                answers,
                price,
                showQuestionsSuccess,
                onNext,
                setOnNext,
                setVideoUrl,
                setPhotoUrls,
                setTelegramId,
                setComment,
                setModel,
                setContractUrl,
                setImei,
                setUsername,
                setUserPhotoUrl,
                setAnswers,
                setShowQuestionsSuccess,
                setPrice
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
