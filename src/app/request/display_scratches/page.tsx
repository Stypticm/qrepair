'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Page } from '@/components/Page';
import { gsap } from 'gsap';

// Универсальная функция для вызова методов Telegram WebApp
const callTelegramMethod = (methodName: string, data?: any) => {
    try {
        if (typeof window !== 'undefined') {
            // Используем официальный API Telegram WebApp
            if ((window as any).Telegram?.WebApp) {
                const webApp = (window as any).Telegram.WebApp;
                
                switch (methodName) {
                    case 'web_app_setup_main_button':
                        if (data.is_visible) {
                            webApp.MainButton.setText(data.text);
                            webApp.MainButton.color = data.color;
                            webApp.MainButton.textColor = data.text_color;
                            webApp.MainButton.show();
                            console.log('📤 MainButton показана');
                        } else {
                            webApp.MainButton.hide();
                            console.log('📤 MainButton скрыта');
                        }
                        break;
                    case 'web_app_trigger_haptic_feedback':
                        if (webApp.HapticFeedback) {
                            webApp.HapticFeedback.impactOccurred(data.impact_style || 'light');
                            console.log('📤 Haptic feedback запущен');
                        }
                        break;
                    default:
                        console.log(`🌐 Неизвестный метод ${methodName}`);
                }
                return;
            }
            
            // Fallback для Desktop и Mobile
            if ((window as any).TelegramWebviewProxy?.postEvent) {
                (window as any).TelegramWebviewProxy.postEvent(methodName, JSON.stringify(data));
                console.log(`📤 Метод ${methodName} вызван через TelegramWebviewProxy`);
                return;
            }
            
            // Fallback для Web версии
            if (window.parent && window.parent !== window) {
                const message = {
                    eventType: methodName,
                    eventData: data
                };
                window.parent.postMessage(JSON.stringify(message), 'https://web.telegram.org');
                console.log(`📤 Метод ${methodName} вызван через postMessage`);
                return;
            }
            
            // Для обычного браузера (fallback)
            console.log(`🌐 Метод ${methodName} недоступен в браузере`);
        }
    } catch (e) {
        console.log(`❌ Ошибка при вызове метода ${methodName}:`, e);
    }
};

// Только царапины на экране
const screenScratches = {
    id: '1',
    category: 'Экран',
    defect: 'Царапины на экране',
    icon: '📱',
    levels: [
        { value: '0', label: 'Отсутствует', penalty: 0 },
        { value: '1', label: 'Лёгкий', penalty: 5 },
        { value: '2', label: 'Средний', penalty: 15 },
        { value: '3', label: 'Тяжёлый', penalty: 30 },
    ],
};

export default function DisplayScratchesPage() {
    const { modelname, answers, setAnswers, telegramId } = useStartForm();
    const router = useRouter();
    const [localAnswer, setLocalAnswer] = useState<number | null>(null);
    const [showCheckmark, setShowCheckmark] = useState(false);
    const [checkmarkPosition, setCheckmarkPosition] = useState<'fullscreen' | 'element' | 'hidden'>('hidden');
    const [isClient, setIsClient] = useState(false);
    
    const fullscreenCheckmarkRef = useRef<HTMLDivElement>(null);

    // Проверяем, что мы на клиенте
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (answers && answers.length > 0) {
            const currentAnswer = answers[0];
            setLocalAnswer(currentAnswer !== undefined && currentAnswer !== null ? currentAnswer : null);
        } else {
            setLocalAnswer(null);
        }
    }, [answers]);

    // Управляем MainButton в зависимости от выбора
    useEffect(() => {
        if (localAnswer !== null) {
            // Показываем MainButton когда выбор сделан
            callTelegramMethod('web_app_setup_main_button', {
                is_visible: true,
                text: 'Далее',
                color: '#00FF00',
                text_color: '#FFFFFF',
                is_active: true
            });
        } else {
            // Скрываем MainButton когда выбор не сделан
            callTelegramMethod('web_app_setup_main_button', {
                is_visible: false
            });
        }
    }, [localAnswer]);

    // Инициализация MainButton при загрузке страницы
    useEffect(() => {
        // Скрываем MainButton при загрузке страницы
        callTelegramMethod('web_app_setup_main_button', {
            is_visible: false
        });
    }, []);

    // Обработчик событий Telegram WebApp
    useEffect(() => {
        // Используем официальный API для обработки событий MainButton
        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
            const webApp = (window as any).Telegram.WebApp;
            
            const handleMainButtonClick = () => {
                console.log('🔘 MainButton нажат на странице царапин (официальный API)');
                
                // Скрываем MainButton при переходе
                callTelegramMethod('web_app_setup_main_button', {
                    is_visible: false
                });
                
                // Переходим на следующую страницу
                router.push('/request/condition');
            };
            
            // Добавляем обработчик события MainButton
            webApp.MainButton.onClick(handleMainButtonClick);
            
            return () => {
                // Удаляем обработчик при размонтировании
                webApp.MainButton.offClick(handleMainButtonClick);
            };
        }
        
        // Fallback обработчик для других случаев
        const handleTelegramEvent = (event: MessageEvent) => {
            try {
                if (event.origin === 'https://web.telegram.org' || event.origin === 'https://t.me') {
                    const data = JSON.parse(event.data);
                    console.log('📥 Получено событие от Telegram:', data);
                    
                    // Обрабатываем нажатие на MainButton
                    if (data.eventType === 'main_button_pressed' || 
                        data.eventType === 'mainButtonPressed' ||
                        data.eventType === 'main_button_clicked' ||
                        data.eventType === 'mainButtonClicked' ||
                        data.eventType === 'main_button_press' ||
                        data.eventType === 'mainButtonPress' ||
                        data.eventType === 'web_app_main_button_pressed' ||
                        data.eventType === 'webAppMainButtonPressed') {
                        console.log('🔘 MainButton нажат на странице царапин (fallback)');
                        
                        // Скрываем MainButton при переходе
                        callTelegramMethod('web_app_setup_main_button', {
                            is_visible: false
                        });
                        
                        // Переходим на следующую страницу
                        router.push('/request/condition');
                    }
                }
            } catch (e) {
                console.log('❌ Ошибка при обработке события Telegram:', e);
            }
        };

        // Добавляем fallback слушатель событий
        window.addEventListener('message', handleTelegramEvent);
        
        return () => {
            window.removeEventListener('message', handleTelegramEvent);
        };
    }, [router]);

    // useEffect для запуска анимации после рендеринга
    useEffect(() => {
        if (!isClient || !showCheckmark) return;
        
        if (checkmarkPosition === 'fullscreen') {
            // Запускаем анимацию через небольшую задержку, чтобы элемент точно отрендерился
            setTimeout(() => {
                if (fullscreenCheckmarkRef.current) {
                    // Сначала устанавливаем начальное состояние
                    gsap.set(fullscreenCheckmarkRef.current, {
                        scale: 0,
                        opacity: 0,
                        rotation: -180
                    });
                    
                    // Затем анимируем к конечному состоянию с более плавными параметрами
                    gsap.to(fullscreenCheckmarkRef.current, {
                        scale: 1,
                        opacity: 1,
                        rotation: 0,
                        duration: 1.0, // Faster
                        ease: "elastic.out(1, 0.3)",
                        onComplete: () => {
                            // Через 1 секунду переводим на элемент
                            setTimeout(() => {
                                setCheckmarkPosition('element');
                            }, 1000); // Faster
                        }
                    });
                }
            }, 50); // Небольшая задержка для рендеринга
        }
    }, [checkmarkPosition, showCheckmark, isClient]);

    const handleSelect = (value: number) => {
        if (!isClient) return;
        
        setLocalAnswer(value);
        
        // Показываем галочку на весь экран
        setShowCheckmark(true);
        setCheckmarkPosition('fullscreen');
        
        // Обновляем ответы
        const newAnswers = [...(answers || [])];
        newAnswers[0] = value;
        setAnswers(newAnswers);
        
        // MainButton автоматически покажется через useEffect
    };

    // MainButton автоматически управляется через useEffect
    // в зависимости от localAnswer

    // Не рендерим ничего до загрузки клиента
    if (!isClient) {
        return <div>Загрузка...</div>;
    }

    return (
        <Page back={true}>
            <div className="w-full">
                <div className="flex flex-col items-center justify-center w-full px-4">
                                            <div className="w-full max-w-md">
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold text-black mb-2">
                                    📱 Царапины на экране
                                </h1>
                                <p className="text-gray-600">
                                    Выберите уровень повреждения экрана
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 w-full">
                                {screenScratches.levels.map((level) => {
                                    const isSelected = localAnswer === parseInt(level.value);
                                    
                                    return (
                                        <div 
                                            key={level.value} 
                                            className={`aspect-square cursor-pointer rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center p-4 relative ${
                                                isSelected
                                                    ? "border-green-500 bg-green-50 shadow-md" 
                                                    : "border-black hover:bg-gray-50"
                                            } bg-white`}
                                            onClick={() => handleSelect(parseInt(level.value))}
                                        >
                                        {/* Большая галочка в центре экрана */}
                                        {showCheckmark && checkmarkPosition === 'fullscreen' && (
                                            <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
                                                {/* Красивый фон */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-500/20 backdrop-blur-[2px]"></div>
                                                
                                                {/* Большая галочка в центре */}
                                                <div 
                                                    ref={fullscreenCheckmarkRef}
                                                    className="w-40 h-40 bg-green-500 rounded-full flex items-center justify-center shadow-2xl"
                                                    style={{
                                                        transform: 'scale(0)',
                                                        opacity: 0
                                                    }}
                                                >
                                                    <span className="text-white text-7xl font-bold">✓</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Галочка в углу выбранного элемента */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                                <span className="text-white text-base font-bold">✓</span>
                                            </div>
                                        )}
                                        
                                        <div className="text-center">
                                            <div className="font-bold text-lg text-black mb-2">
                                                {level.label}
                                            </div>
                                            <div className="text-sm font-bold text-black">
                                                {level.penalty > 0 ? `-${level.penalty}%` : '0%'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Кнопка "Далее" для тестирования на ПК */}
                        {typeof window !== 'undefined' && !(window as any).Telegram?.WebApp && localAnswer !== null && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => router.push('/request/condition')}
                                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Далее →
                                </button>
                                <p className="text-xs text-gray-600 mt-2">
                                    (Эта кнопка видна только при тестировании на ПК)
                                </p>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </Page>
    );
}