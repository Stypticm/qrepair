'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Page } from '@/components/Page';
import { gsap } from 'gsap';

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

export default function QuestionsPage() {
    const { modelname, answers, setAnswers, telegramId } = useStartForm();
    const router = useRouter();
    const [localAnswer, setLocalAnswer] = useState<number | null>(null);
    const [showCheckmark, setShowCheckmark] = useState(false);
    const [checkmarkPosition, setCheckmarkPosition] = useState<'fullscreen' | 'element' | 'hidden'>('hidden');
    const [isClient, setIsClient] = useState(false);
    
    const fullscreenCheckmarkRef = useRef<HTMLDivElement>(null);
    const elementCheckmarkRef = useRef<HTMLDivElement>(null);

    // Проверяем, что мы на клиенте
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Проверяем GSAP только на клиенте
    useEffect(() => {
        if (!isClient) return;
        
        console.log('🔍 ===== Проверка GSAP =====');
        console.log('🔍 GSAP загружен:', typeof gsap);
        console.log('🔍 gsap.to доступен:', typeof gsap.to);
        console.log('🔍 gsap.set доступен:', typeof gsap.set);
    }, [isClient]);

    useEffect(() => {
        if (answers && answers.length > 0) {
            const currentAnswer = answers[0];
            setLocalAnswer(currentAnswer !== undefined && currentAnswer !== null ? currentAnswer : null);
        } else {
            setLocalAnswer(null);
        }
    }, [answers]);

    // Отладка состояний только на клиенте
    useEffect(() => {
        if (!isClient) return;
        
        // Логи убраны для чистоты
    }, [showCheckmark, checkmarkPosition, isClient]);

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
    };

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
                        duration: 1.0,
                        ease: "elastic.out(1, 0.3)",
                        onComplete: () => {
                            // Через 1 секунду переводим на элемент
                            setTimeout(() => {
                                setCheckmarkPosition('element');
                            }, 1000);
                        }
                    });
                }
            }, 50); // Небольшая задержка для рендеринга
            
        } else if (checkmarkPosition === 'element') {
            setTimeout(() => {
                if (elementCheckmarkRef.current) {
                    gsap.set(elementCheckmarkRef.current, {
                        scale: 0,
                        opacity: 0,
                        y: -40
                    });
                    
                    gsap.to(elementCheckmarkRef.current, {
                        scale: 1,
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "back.out(1.7)",
                        onComplete: () => {
                            // Через 1.5 секунды скрываем
                            setTimeout(() => {
                                if (elementCheckmarkRef.current) {
                                    gsap.to(elementCheckmarkRef.current, {
                                        scale: 0,
                                        opacity: 0,
                                        duration: 0.4,
                                        ease: "power2.in",
                                        onComplete: () => {
                                            setShowCheckmark(false);
                                            setCheckmarkPosition('hidden');
                                        }
                                    });
                                }
                            }, 1500);
                        }
                    });
                }
            }, 50);
        }
    }, [checkmarkPosition, showCheckmark, isClient]);

    const isNextDisabled = localAnswer === null;

    // Не рендерим ничего до загрузки клиента
    if (!isClient) {
        return <div>Загрузка...</div>;
    }

    return (
        <Page back={true}>
            <div className="w-full">
                <div className="flex flex-col items-center justify-center w-full px-4">
                    <div className="w-full max-w-md">
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {screenScratches.levels.map((level) => {
                                const isSelected = localAnswer === parseInt(level.value);
                                
                                return (
                                    <div 
                                        key={level.value} 
                                        className={`aspect-square cursor-pointer rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center p-4 relative ${
                                            isSelected
                                                ? "border-black bg-gray-100 shadow-md" 
                                                : "border-black hover:bg-gray-50"
                                        } bg-white`}
                                        onClick={() => handleSelect(parseInt(level.value))}
                                    >
                                        {/* Индикатор выбора с GSAP анимацией */}
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
                                        
                                        {/* Постоянная галочка в углу выбранного элемента */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                                <span className="text-white text-sm font-bold">✓</span>
                                            </div>
                                        )}
                                        
                                        {/* Временная анимированная галочка для перехода */}
                                        {isSelected && checkmarkPosition === 'element' && (
                                            <div 
                                                ref={elementCheckmarkRef}
                                                className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                                                style={{
                                                    transform: 'scale(0)',
                                                    opacity: 0
                                                }}
                                            >
                                                <span className="text-white text-sm font-bold">✓</span>
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
                    </div>
                </div>
            </div>
        </Page>
    );
}