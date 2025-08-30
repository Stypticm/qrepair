'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { getImageUrl } from '@/core/lib/assets';

interface ConditionOption {
    id: string;
    label: string;
    penalty: number;
    image: string;
}

const frontConditions: ConditionOption[] = [
    {
        id: 'display_front_new',
        label: 'Новый',
        penalty: 0,
        image: 'display_front_new'
    },
    {
        id: 'display_front',
        label: 'Очень\nхорошее',
        penalty: -3,
        image: 'display_front'
    },
    {
        id: 'display_front_have_scratches',
        label: 'Заметные\nцарапины',
        penalty: -8,
        image: 'display_front_have_scratches'
    },
    {
        id: 'display_front_scratches',
        label: 'Трещины',
        penalty: -15,
        image: 'display_front_scratches'
    }
];

const backConditions: ConditionOption[] = [
    {
        id: 'display_back_new',
        label: 'Новый',
        penalty: 0,
        image: 'display_back_new'
    },
    {
        id: 'display_back',
        label: 'Очень\nхорошее',
        penalty: -3,
        image: 'display_back'
    },
    {
        id: 'display_back_have_scratches',
        label: 'Заметные\nцарапины',
        penalty: -8,
        image: 'display_back_have_scratches'
    },
    {
        id: 'display_back_scratches',
        label: 'Трещины',
        penalty: -15,
        image: 'display_back_scratches'
    }
];

const sideConditions: ConditionOption[] = [
    {
        id: 'display_side_new',
        label: 'Новый',
        penalty: 0,
        image: 'display_side_new'
    },
    {
        id: 'display_side',
        label: 'Очень\nхорошее',
        penalty: -3,
        image: 'display_side'
    },
    {
        id: 'display_side_have_scratches',
        label: 'Заметные\nцарапины',
        penalty: -8,
        image: 'display_side_have_scratches'
    },
    {
        id: 'display_side_scratches',
        label: 'Трещины',
        penalty: -15,
        image: 'display_side_scratches'
    }
];

export default function ConditionPage() {
    const { modelname, telegramId, deviceConditions, setDeviceConditions, username, setModel, setPrice } = useStartForm();
    const router = useRouter();
    
    // Состояние для отслеживания изменений
    const [hasChanges, setHasChanges] = useState(false);
    
    // Флаг для отслеживания загрузки состояний из БД
    const [loadedFromDB, setLoadedFromDB] = useState(false);

    // Загрузка сохраненных состояний из sessionStorage или БД
    const loadSavedConditions = useCallback(async () => {
        // Сначала пытаемся восстановить из sessionStorage
        if (typeof window !== 'undefined') {
            const savedInSession = sessionStorage.getItem('deviceConditions');
            
            if (savedInSession) {
                try {
                    const parsed = JSON.parse(savedInSession);
                    console.log('Восстановлены состояния из sessionStorage:', parsed);
                    setDeviceConditions(parsed);
                    return; // Не загружаем из БД, если есть в sessionStorage
                } catch (e) {
                    console.error('Ошибка при парсинге sessionStorage:', e);
                    sessionStorage.removeItem('deviceConditions'); // Очищаем поврежденные данные
                }
            }
        }

        // Если нет данных в sessionStorage, загружаем из БД
        try {
            const timestamp = Date.now();
            const url = `/api/request/getConditions?t=${timestamp}`;
            
            const response = await fetch(url, {
                headers: {
                    'x-telegram-id': telegramId || 'test-user'
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Загружены данные из БД:', data);
                
                // Проверяем статус заявки - если submitted, то НЕ загружаем старые состояния
                if (data.status === 'submitted') {
                    console.log('Заявка уже отправлена, сбрасываем состояния');
                    setDeviceConditions({
                        front: null,
                        back: null,
                        side: null
                    });
                    setHasChanges(false);
                    return;
                }
                
                // Обновляем состояния устройства только для черновиков
                if (data.deviceConditions && data.status !== 'submitted') {
                    // Проверяем, что это действительно новая заявка, а не старая
                    const hasOldData = data.deviceConditions.front || data.deviceConditions.back || data.deviceConditions.side;
                    if (hasOldData) {
                        console.log('Найдены сохраненные состояния, загружаем их:', data.deviceConditions);
                        setDeviceConditions(data.deviceConditions);
                        setHasChanges(true); // Устанавливаем флаг изменений для загруженных из БД состояний
                        setLoadedFromDB(true); // Устанавливаем флаг загрузки из БД
                    } else {
                        console.log('Нет сохраненных состояний, оставляем пустыми');
                        // НЕ сбрасываем состояния - они уже пустые по умолчанию
                        setLoadedFromDB(true); // Устанавливаем флаг загрузки из БД
                    }
                }
                
                // Дополнительная проверка: если в БД есть старые названия "Значительные царапины", заменяем их на "Заметные царапины"
                if (data.deviceConditions) {
                    const updatedConditions = { ...data.deviceConditions };
                    let hasChanges = false;
                    
                    if (updatedConditions.front === 'Значительные царапины') {
                        updatedConditions.front = 'Заметные царапины';
                        hasChanges = true;
                    }
                    if (updatedConditions.back === 'Значительные царапины') {
                        updatedConditions.back = 'Заметные царапины';
                        hasChanges = true;
                    }
                    if (updatedConditions.side === 'Значительные царапины') {
                        updatedConditions.side = 'Заметные царапины';
                        hasChanges = true;
                    }
                    
                    if (hasChanges) {
                        console.log('Обновляем старые названия состояний:', updatedConditions);
                        setDeviceConditions(updatedConditions);
                    }
                }
                
                // Обновляем модель если есть
                if (data.modelname) {
                    setModel(data.modelname);
                    console.log('Установлена модель:', data.modelname);
                }
                
                // Обновляем цену если есть
                if (data.price) {
                    setPrice(data.price);
                    console.log('Установлена цена:', data.price);
                }
            } else {
                console.log('Нет сохраненных данных в БД');
            }
        } catch (error) {
            console.error('Ошибка загрузки состояний из БД:', error);
        }
    }, [telegramId, setDeviceConditions, setModel, setPrice]);

    // Проверяем, все ли условия выбраны
    const isAllConditionsSelected = useCallback(() => {
        return deviceConditions.front && deviceConditions.back && deviceConditions.side;
    }, [deviceConditions]);

    // Состояние для диалогового окна
    const [showDialog, setShowDialog] = useState(false);

    // Показываем диалог когда все условия выбраны (включая загруженные из БД)
    useEffect(() => {
        if (isAllConditionsSelected()) {
            // Небольшая задержка для лучшего UX
            setTimeout(() => {
                setShowDialog(true);
            }, 300);
        }
    }, [deviceConditions, isAllConditionsSelected]);

    // Создаем заявку при загрузке страницы (если её еще нет)
    useEffect(() => {
        const createRequest = async () => {
            if (telegramId) {
                try {
                    // Создаем заявку только если её нет
                    const response = await fetch('/api/request/choose', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            telegramId,
                            username: username || 'Unknown',
                        }),
                    });
                    
                    if (response.ok) {
                        console.log('Заявка создана или найдена');
                        
                        // НЕ сбрасываем состояния здесь - это делается только для действительно новых заявок
                        // Состояния будут загружены в loadSavedConditions() если они есть
                        
                        // Очищаем sessionStorage только для новых заявок
                        if (typeof window !== 'undefined') {
                            const savedInSession = sessionStorage.getItem('deviceConditions');
                            if (!savedInSession) {
                                sessionStorage.removeItem('deviceConditions');
                                console.log('sessionStorage очищен для новой заявки');
                            }
                        }
                        
                        // НЕ загружаем состояния из БД для новых заявок - это делается только для продолжения существующих
                        // Состояния уже установлены в первом useEffect на основе sessionStorage
                        
                        // Устанавливаем флаг загрузки для новой заявки
                        setLoadedFromDB(true);
                    }
                } catch (error) {
                    console.error('Error creating request:', error);
                }
            }
        };

        createRequest();
    }, [telegramId, username, loadSavedConditions]);

    // Загружаем сохраненные состояния только после создания заявки
    useEffect(() => {
        if (telegramId) {
            // Не загружаем состояния сразу - ждем создания заявки
        } else {
            // Сбрасываем состояния только если нет telegramId (для новых пользователей)
            setDeviceConditions({
                front: null,
                back: null,
                side: null
            });
            setHasChanges(false);
            setLoadedFromDB(true); // Устанавливаем флаг загрузки для новых пользователей
        }
    }, [telegramId, setDeviceConditions]);

    // Восстанавливаем состояния из sessionStorage при возврате на страницу (продолжение заявки)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedInSession = sessionStorage.getItem('deviceConditions');
            
            if (savedInSession) {
                try {
                    const parsed = JSON.parse(savedInSession);
                    console.log('Продолжение заявки - восстановлены состояния из sessionStorage:', parsed);
                    setDeviceConditions(parsed);
                    setHasChanges(true); // Устанавливаем флаг изменений для восстановленных состояний
                    setLoadedFromDB(true); // Устанавливаем флаг загрузки
                } catch (e) {
                    console.error('Ошибка при парсинге sessionStorage при возврате:', e);
                    sessionStorage.removeItem('deviceConditions');
                }
            }
        }
        
        // Устанавливаем флаг загрузки для новой заявки
        setLoadedFromDB(true);
    }, [setDeviceConditions]); // Запускается только один раз при загрузке страницы


    // Обработчики диалогового окна
    const handleContinue = () => {
        setShowDialog(false);
        router.push('/request/submit');
    };

    const handleEdit = () => {
        setShowDialog(false);
        // При редактировании сбрасываем флаг изменений
        setHasChanges(false);
    };

    // Убираем сохранение в БД
    // const saveConditionsToDatabase = async () => { ... };

    // Обработчик выбора условия
    const handleConditionSelect = (type: 'front' | 'back' | 'side', conditionId: string) => {
        // Вибрация при выборе
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
        
        // Получаем текстовое описание состояния
        const conditionText = getConditionText(conditionId);
        
        // Проверяем, изменилось ли состояние
        if (deviceConditions[type] !== conditionText) {
            const newConditions = {
                ...deviceConditions,
                [type]: conditionText
            };
            
            // Сначала обновляем контекст
            setDeviceConditions(newConditions);
            
            // Сохраняем в sessionStorage для быстрого восстановления
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('deviceConditions', JSON.stringify(newConditions));
                console.log('Состояния сохранены в sessionStorage:', newConditions);
            }
            
            // Затем сохраняем состояния в БД
            saveConditionsToDatabase(newConditions);
        }
    };

    // Сохранение состояний в БД
    const saveConditionsToDatabase = async (newConditions: any) => {
        try {
            // Получаем базовую цену из контекста или устанавливаем по умолчанию
            const basePrice = 48000; // Базовая цена по умолчанию
            
            // Рассчитываем финальную цену с учетом состояний
            const finalPrice = calculateFinalPrice(basePrice);
            
            // Устанавливаем цену в контекст
            setPrice(finalPrice);
            
            const requestBody = {
                deviceConditions: newConditions,
                price: finalPrice
            };
            
            const response = await fetch('/api/request/saveConditions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-id': telegramId || 'test-user'
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                console.error('Ошибка сохранения состояний в БД:', response.status);
            }
        } catch (error) {
            console.error('Ошибка при сохранении состояний в БД:', error);
        }
    };

    // Функция для получения текстового описания состояния
    const getConditionText = (conditionId: string): string => {
        if (conditionId.includes('_new')) {
            return 'Новый';
        } else if (conditionId.includes('_have_scratches')) {
            return 'Заметные царапины';
        } else if (conditionId.includes('_scratches')) {
            return 'Трещины';
        } else if (conditionId.includes('display_front') || conditionId.includes('display_back') || conditionId.includes('display_side')) {
            return 'Очень хорошее';
        } else {
            return conditionId; // fallback
        }
    };

    // Функция для получения процента скидки по ID состояния
    const getConditionPenalty = (conditionId: string): number => {
        if (conditionId.includes('_new')) {
            return 0;
        } else if (conditionId.includes('_have_scratches')) {
            return -8;
        } else if (conditionId.includes('_scratches')) {
            return -15;
        } else if (conditionId.includes('display_front') || conditionId.includes('display_back') || conditionId.includes('display_side')) {
            return -3;
        } else {
            return 0; // fallback
        }
    };

    // Функция для расчета финальной цены с учетом состояний
    const calculateFinalPrice = (basePrice: number): number => {
        let totalPenalty = 0;
        
        // Суммируем проценты по всем выбранным состояниям
        if (deviceConditions.front) {
            const frontCondition = frontConditions.find(c => getConditionText(c.id) === deviceConditions.front);
            if (frontCondition) totalPenalty += frontCondition.penalty;
        }
        if (deviceConditions.back) {
            const backCondition = backConditions.find(c => getConditionText(c.id) === deviceConditions.back);
            if (backCondition) totalPenalty += backCondition.penalty;
        }
        if (deviceConditions.side) {
            const sideCondition = sideConditions.find(c => getConditionText(c.id) === deviceConditions.side);
            if (sideCondition) totalPenalty += sideCondition.penalty;
        }
        
        // Ограничиваем максимальный вычет 50%
        if (totalPenalty < -50) totalPenalty = -50;
        
        // Рассчитываем финальную цену
        const finalPrice = basePrice * (1 + totalPenalty / 100);
        
        // Ограничиваем минимальную цену 50% от базовой
        const minPrice = basePrice * 0.5;
        return Math.max(finalPrice, minPrice);
    };

    // Функция для расчета общего процента вычета (для диалога)
    const calculateTotalPenalty = (): number => {
        let totalPenalty = 0;
        
        if (deviceConditions.front) {
            if (deviceConditions.front === 'Новый') totalPenalty += 0;
            else if (deviceConditions.front === 'Очень хорошее') totalPenalty += -3;
            else if (deviceConditions.front === 'Заметные царапины') totalPenalty += -8;
            else if (deviceConditions.front === 'Трещины') totalPenalty += -15;
        }
        
        if (deviceConditions.back) {
            if (deviceConditions.back === 'Новый') totalPenalty += 0;
            else if (deviceConditions.back === 'Очень хорошее') totalPenalty += -3;
            else if (deviceConditions.back === 'Заметные царапины') totalPenalty += -8;
            else if (deviceConditions.back === 'Трещины') totalPenalty += -15;
        }
        
        if (deviceConditions.side) {
            if (deviceConditions.side === 'Новый') totalPenalty += 0;
            else if (deviceConditions.side === 'Очень хорошее') totalPenalty += -3;
            else if (deviceConditions.side === 'Заметные царапины') totalPenalty += -8;
            else if (deviceConditions.side === 'Трещины') totalPenalty += -15;
        }
        
        return totalPenalty;
    };

    // Проверяем, можно ли выбрать секцию
    const canSelectSection = (type: 'front' | 'back' | 'side'): boolean => {
        if (type === 'front') return true; // Передняя часть всегда доступна
        if (type === 'back') return !!deviceConditions.front; // Задняя только после выбора передней
        if (type === 'side') return !!deviceConditions.front && !!deviceConditions.back; // Боковые только после выбора обеих панелей
        return false;
    };

    // Рендерим секцию выбора условий
    const renderConditionSection = (type: 'front' | 'back' | 'side', conditions: ConditionOption[]) => {
        // Разные размеры изображений для разных секций
        const getImageStyle = () => {
            if (type === 'side') {
                // Боковые грани - такая же ширина как у передней и задней части, но узкие по высоте
                return 'w-full h-6 rounded-lg';
            } else {
                // Передняя и задняя панель - прямоугольные как телефон, большая высота для полной видимости без обрезки
                return 'w-full h-36 rounded-lg';
            }
        };
        


    return (
            <div className="space-y-1">
                {/* Заголовок секции */}
                <h3 className="text-base font-semibold text-center">
                    {type === 'front' ? 'Передняя часть' : type === 'back' ? 'Задняя панель' : 'Боковые грани'}
                    {!canSelectSection(type) && (
                        <span className="block text-sm text-gray-500 font-normal mt-1">
                            {type === 'back' ? 'Сначала выберите переднюю часть' : 'Сначала выберите переднюю и заднюю части'}
                        </span>
                    )}
                </h3>

                {/* Сетка вариантов */}
                <div className="grid grid-cols-4 gap-2">
                    {conditions.map((condition) => (
                        <Card
                            key={condition.id}
                            className={`transition-all duration-200 relative ${
                                deviceConditions[type] === getConditionText(condition.id)
                                    ? 'ring-2 ring-[#2dc2c6] bg-[#2dc2c6]/10'
                                    : ''
                            } ${
                                canSelectSection(type) 
                                    ? 'cursor-pointer hover:shadow-md' 
                                    : 'cursor-not-allowed opacity-50'
                            }`}
                            onClick={() => canSelectSection(type) && handleConditionSelect(type, condition.id)}

                        >
                            {deviceConditions[type] === getConditionText(condition.id) && (
                                <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10">
                                    <span className="text-white text-xs font-bold">✓</span>
                                </div>
                            )}
                            <CardContent className="p-1 pb-1">
                                {/* Изображение - разные размеры для разных секций */}
                                <div className={`relative ${getImageStyle()} overflow-hidden bg-gray-100`}>
                                    <Image
                                        src={getImageUrl(`${condition.image}.png`)}
                                        alt={condition.label}
                                        width={80}
                                        height={type === 'side' ? 24 : 144}
                                        className="damage-image w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error(`Ошибка загрузки изображения: ${condition.image}.png`);
                                        }}
                                        priority
                                    />
                                </div>

                                                                 {/* Название условия */}
                                 <h4 className="text-xs font-medium text-gray-900 text-center leading-tight whitespace-pre-line mt-0.5">
                                     {condition.label}
                                 </h4>
                                 

                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

        return (
        <Page back={true}>
            <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
                <div className="flex-1 p-4">
                    <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
                        
                        {/* Секция передней части экрана */}
                        <div className="flex-1 flex flex-col justify-center space-y-4">
                            {renderConditionSection('front', frontConditions)}
                        </div>

                        {/* Разделитель */}
                        <div className="border-t border-gray-200 my-3"></div>

                        {/* Секция задней панели */}
                        <div className={`flex-1 flex flex-col justify-center space-y-4 ${!canSelectSection('back') ? 'opacity-50' : ''}`}>
                            {renderConditionSection('back', backConditions)}
                        </div>

                        {/* Разделитель */}
                        <div className="border-t border-gray-200 my-3"></div>

                        {/* Секция боковых граней */}
                        <div className={`flex-1 flex flex-col justify-center space-y-4 ${!canSelectSection('side') ? 'opacity-50' : ''}`}>
                            {renderConditionSection('side', sideConditions)}
                                    </div>
                                        </div>
                                    </div>
                                </div>

             {/* Диалоговое окно с итоговой информацией */}
             <Dialog open={showDialog} onOpenChange={handleEdit}>
                 <DialogContent
                     className="bg-white border border-gray-200 cursor-pointer w-[95vw] max-w-md mx-auto rounded-xl shadow-lg"
                     onClick={handleContinue}
                     showCloseButton={false}
                 >
                     <DialogTitle className="text-center text-xl font-semibold text-gray-900 mb-3">
                         📱 Наша оценка
                     </DialogTitle>
                     
                     <div className="text-center">
                         {/* Показываем выбранные условия */}
                         <div className="space-y-2 mb-4">
                             {deviceConditions.front && (
                                 <div className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg">
                                     <span className="text-gray-600">Передняя панель:</span>
                                     <span className="font-medium text-gray-900">{deviceConditions.front}</span>
                                 </div>
                             )}
                             {deviceConditions.back && (
                                 <div className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg">
                                     <span className="text-gray-600">Задняя панель:</span>
                                     <span className="font-medium text-gray-900">{deviceConditions.back}</span>
                                                    </div>
                             )}
                             {deviceConditions.side && (
                                 <div className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg">
                                     <span className="text-gray-600">Боковые грани:</span>
                                     <span className="font-medium text-gray-900">{deviceConditions.side}</span>
                    </div>
                )}
                         </div>
                         
                         
                         
                         <p className="text-center text-sm text-gray-600 mt-3">
                             👆 Нажмите на окно для перехода к следующему шагу
                         </p>
                         <p className="text-center text-sm text-gray-600 mt-1">
                             ✏️ Нажмите вне поля, если хотите отредактировать свой выбор
                         </p>
                     </div>
                 </DialogContent>
             </Dialog>
        </Page>
    );
 }
