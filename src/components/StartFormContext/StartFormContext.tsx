'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useSignal, initDataState as _initDataState } from '@telegram-apps/sdk-react';
import { FormState } from '@/core/lib/interfaces';
import { useAppStore } from '@/stores/authStore';

// Функция для получения пути по шагу
const getPathForStep = (step: string): string | null => {
    switch (step) {
        case 'device-info':
            return '/request/device-info';
        case 'form':
            return '/request/form';
        case 'condition':
            return '/request/evaluation';
        case 'additional-condition':
            return '/request/additional-condition';
        case 'submit':
            return '/request/submit';
        case 'delivery-options':
            return '/request/delivery-options';
        case 'pickup-points':
            return '/request/pickup-points';
        case 'courier-booking':
            return '/request/courier-booking';
        case 'final':
            return '/request/final';
        default:
            return null;
    }
};

const StartFormContext = createContext<FormState | null>(null);

export function StartFormProvider({ children }: { children: ReactNode }) {
    // Всегда вызываем хук - это требование React
    const initDataState = useSignal(_initDataState);
    
    // Получаем данные из Zustand store для синхронизации
    const { telegramId: storeTelegramId, username: storeUsername, setTelegramId: setStoreTelegramId, setUsername: setStoreUsername } = useAppStore();

    const [username, setUsername] = useState<string | null>(null);
    const [telegramId, setTelegramId] = useState<string | null>(null);
    const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
    
    // Состояние для отладочной информации
    const [debugInfo, setDebugInfo] = useState<string[]>([]);

    // Функция для добавления отладочной информации
    const addDebugInfo = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const debugMessage = `[${timestamp}] ${message}`;
        setDebugInfo(prev => [...prev.slice(-9), debugMessage]); // Показываем последние 10 сообщений
    }, []);

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
        faceId?: string | null;
        touchId?: string | null;
        backCamera?: string | null;
        battery?: string | null;
    }>({
        front: null,
        back: null,
        side: null,
        faceId: null,
        touchId: null,
        backCamera: null,
        battery: null
    });

    // Функция для сброса всех состояний
    const resetAllStates = () => {
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
            side: null,
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
            // additionalConditions больше не используется
            sessionStorage.removeItem('price');
            sessionStorage.removeItem('hasSeenWelcome'); // Сбрасываем флаг приветствия
        }
        
    };

    useEffect(() => {
        addDebugInfo('StartFormContext: initDataState changed');
        addDebugInfo(`initDataState?.user: ${initDataState?.user ? 'ЕСТЬ' : 'НЕТ'}`);
        addDebugInfo(`window.Telegram?.WebApp: ${typeof window !== 'undefined' && window.Telegram?.WebApp ? 'ЕСТЬ' : 'НЕТ'}`);
        
        if (initDataState?.user) {
            addDebugInfo('StartFormContext: Получены данные из initDataState');
            addDebugInfo(`Username: ${initDataState.user.first_name || 'НЕТ'}`);
            addDebugInfo(`ID: ${initDataState.user.id || 'НЕТ'}`);
            
            setUsername(initDataState.user.first_name ?? null);
            
            // Устанавливаем telegramId только если он еще не установлен
            if (!telegramId) {
                addDebugInfo(`Устанавливаем telegramId: ${initDataState.user.id}`);
                setTelegramId(String(initDataState.user.id));
            } else {
                addDebugInfo(`telegramId уже установлен: ${telegramId}`);
            }
            
            setUserPhotoUrl(initDataState.user.photo_url ?? null);
        } else if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
            // Fallback: пытаемся получить данные напрямую из window.Telegram.WebApp
            addDebugInfo('StartFormContext: Fallback - получаем данные из window.Telegram.WebApp');
            const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
            addDebugInfo(`Fallback user data: ${JSON.stringify(tgUser)}`);
            
            if (tgUser.id) {
                addDebugInfo(`Fallback - Setting telegramId: ${tgUser.id}`);
                setTelegramId(String(tgUser.id));
            }
            
            if (tgUser.first_name) {
                addDebugInfo(`Fallback - Setting username: ${tgUser.first_name}`);
                setUsername(tgUser.first_name);
            }
            
            if ((tgUser as any).photo_url) {
                setUserPhotoUrl((tgUser as any).photo_url);
            }
            
            // Сохраняем username из Telegram для использования на финальной страницы
            if (tgUser.username) {
                addDebugInfo(`Saving telegram username from fallback: ${tgUser.username}`);
                sessionStorage.setItem('telegramUsername', tgUser.username);
            } else {
                addDebugInfo('No username found in Telegram user data');
                
                // Fallback для тестирования в браузере
                if (process.env.NODE_ENV === 'development') {
                    addDebugInfo('Using fallback username for development in StartFormContext');
                    sessionStorage.setItem('telegramUsername', 'qoqos_app');
                }
            }
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
                    
                    // Восстанавливаем данные из БД
                    if (data.modelname) {
                        setModel(data.modelname);
                    }
                    if (data.price) setPrice(data.price);
                    if (data.imei) setImei(data.imei);
                    if (data.sn) setSerialNumber(data.sn);
                    if (data.deviceConditions) setDeviceConditions(data.deviceConditions);
                    // additionalConditions устарело
                    
                    // Восстанавливаем текущий шаг из БД
                    if (data.currentStep) {
                        // Сохраняем в sessionStorage для NavigationContext
                        if (typeof window !== 'undefined') {
                            sessionStorage.setItem('currentStep', data.currentStep);
                        }
                    }
                    
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки данных из БД:', error);
        }
    };

    // Синхронизируем данные с Zustand store
    useEffect(() => {
        if (storeTelegramId && storeTelegramId !== telegramId) {
            addDebugInfo(`Синхронизация telegramId из store: ${storeTelegramId}`);
            setTelegramId(storeTelegramId);
        }
    }, [storeTelegramId, addDebugInfo, telegramId]);

    useEffect(() => {
        if (storeUsername && storeUsername !== username) {
            addDebugInfo(`Синхронизация username из store: ${storeUsername}`);
            setUsername(storeUsername);
        }
    }, [storeUsername, addDebugInfo, username]);

    // Синхронизируем изменения обратно в store
    useEffect(() => {
        if (telegramId && telegramId !== storeTelegramId) {
            addDebugInfo(`Синхронизация telegramId в store: ${telegramId}`);
            setStoreTelegramId(telegramId);
        }
    }, [telegramId, storeTelegramId, addDebugInfo, setStoreTelegramId]);

    useEffect(() => {
        if (username && username !== storeUsername) {
            addDebugInfo(`Синхронизация username в store: ${username}`);
            setStoreUsername(username);
        }
    }, [username, storeUsername, addDebugInfo, setStoreUsername]);

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
                resetAllStates,
                loadSavedData,
                debugInfo,
                addDebugInfo
            } as FormState}
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
