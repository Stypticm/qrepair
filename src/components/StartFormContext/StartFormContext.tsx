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
    const [serialNumber, setSerialNumber] = useState<string | null>(null);
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

    // Дополнительные состояния устройства
    const [additionalConditions, setAdditionalConditions] = useState<{
        faceId: string | null;
        touchId: string | null;
        backCamera: string | null;
        battery: string | null;
    }>({
        faceId: null,
        touchId: null,
        backCamera: null,
        battery: null
    });

    // Функция для сброса всех состояний
    const resetAllStates = () => {
        console.log('Сбрасываю все состояния формы...');
        setModel('Apple iPhone 11');
        setComment('');
        setImei(null);
        setSerialNumber(null);
        setShowQuestionsSuccess(false);
        setPrice(null);
        setOnNext(undefined);
        setDeviceConditions({
            front: null,
            back: null,
            side: null
        });
        setAdditionalConditions({
            faceId: null,
            touchId: null,
            backCamera: null,
            battery: null
        });
        
        // Очищаем sessionStorage при сбросе состояний
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('phoneSelection');
            sessionStorage.removeItem('imei');
            sessionStorage.removeItem('serialNumber');
            sessionStorage.removeItem('deviceConditions');
            sessionStorage.removeItem('additionalConditions');
            console.log('sessionStorage очищен');
        }
        
        console.log('Все состояния сброшены');
    };

    useEffect(() => {
        if (initDataState?.user) {
            setUsername(initDataState.user.first_name ?? null);
            setTelegramId(String(initDataState.user.id));
            setUserPhotoUrl(initDataState.user.photo_url ?? null);
        }
    }, [initDataState]);

    // Функция для загрузки сохраненных данных из БД
    const loadSavedData = async (telegramId: string) => {
        try {
            const response = await fetch('/api/request/getDraft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ telegramId }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data) {
                    console.log('Загружаем данные из БД:', data);
                    
                    // Восстанавливаем данные из БД
                    if (data.modelname) {
                        console.log('Восстанавливаем modelname из БД:', data.modelname);
                        setModel(data.modelname);
                    }
                    if (data.price) setPrice(data.price);
                    if (data.imei) setImei(data.imei);
                    if (data.sn) setSerialNumber(data.sn);
                    if (data.deviceConditions) setDeviceConditions(data.deviceConditions);
                    if (data.additionalConditions) setAdditionalConditions(data.additionalConditions);
                    
                    console.log('Данные восстановлены из БД:', data);
                } else {
                    console.log('Нет данных в БД для telegramId:', telegramId);
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки данных из БД:', error);
        }
    };

    // Загружаем данные при инициализации telegramId
    useEffect(() => {
        if (telegramId) {
            loadSavedData(telegramId);
        }
    }, [telegramId]);

    return (
        <StartFormContext.Provider
            value={{
                username,
                modelname,
                telegramId,
                userPhotoUrl,
                comment,
                imei,
                serialNumber,
                price,
                showQuestionsSuccess,
                onNext,
                deviceConditions,
                additionalConditions,
                setOnNext,
                setTelegramId,
                setSerialNumber,
                setComment,
                setModel,
                setImei,
                setUsername,
                setUserPhotoUrl,
                setShowQuestionsSuccess,
                setPrice,
                setDeviceConditions,
                setAdditionalConditions,
                resetAllStates,
                loadSavedData
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
