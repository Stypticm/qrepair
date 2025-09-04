'use client'

import { useState, useEffect } from 'react'
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { useNavigation } from '@/components/NavigationContext/NavigationContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { motion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPinIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
// Telegram SDK will be accessed via window.Telegram.WebApp

const CourierBookingPage = () => {
    const router = useRouter();
    const { telegramId, modelname, price } = useStartForm();
    const { setCurrentStep } = useNavigation();
    // Access Telegram WebApp API
    const getTelegramWebApp = () => {
        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
            return (window as any).Telegram.WebApp;
        }
        return null;
    };
    const [address, setAddress] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [navigating, setNavigating] = useState(false);
    const [locationMethod, setLocationMethod] = useState<'telegram' | 'manual' | null>(null);
    const [isRequestingLocation, setIsRequestingLocation] = useState(false);

    // Устанавливаем текущий шаг при загрузке страницы
    useEffect(() => {
        setCurrentStep('courier-booking');
        
        // Сохраняем текущий шаг в БД
        const saveCurrentStep = async () => {
            try {
                await fetch('/api/request/saveCurrentStep', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        telegramId,
                        currentStep: 'courier-booking',
                    }),
                });
            } catch (error) {
                console.error('Error saving current step:', error);
            }
        };
        
        if (telegramId) {
            saveCurrentStep();
        }
    }, [setCurrentStep, telegramId]);

    // Восстанавливаем состояние из sessionStorage при загрузке
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCourierData = sessionStorage.getItem('courierBookingData');
            if (savedCourierData) {
                try {
                    const parsed = JSON.parse(savedCourierData);
                    if (parsed.address) setAddress(parsed.address);
                    if (parsed.selectedDate) setSelectedDate(new Date(parsed.selectedDate));
                    if (parsed.selectedTime) setSelectedTime(parsed.selectedTime);
                    if (parsed.locationMethod) setLocationMethod(parsed.locationMethod);
                } catch (e) {
                    console.error('Ошибка при восстановлении данных мастера:', e);
                    sessionStorage.removeItem('courierBookingData');
                }
            }
        }
    }, []);

    // Сохраняем состояние в sessionStorage при изменениях
    useEffect(() => {
        if (typeof window !== 'undefined' && (address || selectedDate || selectedTime || locationMethod)) {
            const courierData = {
                address,
                selectedDate: selectedDate?.toISOString(),
                selectedTime,
                locationMethod
            };
            sessionStorage.setItem('courierBookingData', JSON.stringify(courierData));
        }
    }, [address, selectedDate, selectedTime, locationMethod]);

    // Генерируем доступные времена с учетом логистики
    const generateAvailableTimes = () => {
        const times = [];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Если дата не выбрана или выбрана сегодня
        if (!selectedDate || selectedDate.toDateString() === now.toDateString()) {
            // Показываем время начиная с текущего часа + 2 (время на дорогу и подготовку)
            const startHour = Math.max(10, currentHour + 2);
            for (let hour = startHour; hour <= 22; hour++) {
                times.push(`${hour.toString().padStart(2, '0')}:00`);
            }
        } else {
            // Если выбрана дата в будущем, показываем все время с 10 до 22
            for (let hour = 10; hour <= 22; hour++) {
                times.push(`${hour.toString().padStart(2, '0')}:00`);
            }
        }
        
        return times;
    };

    // Генерируем доступные времена с учетом уже выбранного времени
    const generateSmartAvailableTimes = (selectedTimeSlot: string) => {
        if (!selectedTimeSlot) return generateAvailableTimes();
        
        const times = [];
        const [selectedHour, selectedMinute] = selectedTimeSlot.split(':').map(Number);
        
        // Время на дорогу и работу мастера (минимум 2 часа)
        const minInterval = 2;
        const nextAvailableHour = selectedHour + minInterval;
        
        // Если выбранное время + интервал превышает рабочее время, показываем только выбранное время
        if (nextAvailableHour > 22) {
            return [selectedTimeSlot];
        }
        
        // Показываем выбранное время и следующие доступные слоты
        times.push(selectedTimeSlot);
        
        for (let hour = nextAvailableHour; hour <= 22; hour++) {
            times.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        
        return times;
    };

    const availableTimes = generateSmartAvailableTimes(selectedTime);

    // Функция для запроса локации через Telegram
    const handleRequestLocation = async () => {
        setIsRequestingLocation(true);
        try {
            const webApp = getTelegramWebApp();
            if (webApp && webApp.requestLocation) {
                // Запрашиваем локацию через Telegram WebApp API
                webApp.requestLocation();
                
                // Listen for location result
                const handleLocationResult = (location: any) => {
                    if (location) {
                        getAddressFromCoordinates(location.latitude, location.longitude)
                            .then(addressFromCoords => {
                                setAddress(addressFromCoords);
                                setLocationMethod('telegram');
                            });
                    }
                    webApp.offEvent('location_changed', handleLocationResult);
                };
                
                webApp.onEvent('location_changed', handleLocationResult);
            } else {
                // Fallback на ручной ввод если Telegram API недоступен
                setLocationMethod('manual');
            }
        } catch (error) {
            console.error('Ошибка при получении локации:', error);
            setLocationMethod('manual');
        } finally {
            setIsRequestingLocation(false);
        }
    };

    // Функция для получения адреса по координатам
    const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
        try {
            // Используем Nominatim API для геокодинга
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru`
            );
            const data = await response.json();
            
            if (data.display_name) {
                return data.display_name;
            }
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (error) {
            console.error('Ошибка геокодинга:', error);
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    };

    const handleSubmit = async () => {
        if (!address.trim() || !selectedDate || !selectedTime) return;

        setSubmitting(true);
        try {
            // Сохраняем выбор в БД
            const response = await fetch('/api/request/submit-delivery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId,
                    modelname: getFullModelName(),
                    price: finalPrice,
                    deliveryMethod: 'courier',
                    courierAddress: address.trim(),
                    courierDate: selectedDate,
                    courierTime: selectedTime,
                }),
            });

            if (response.ok) {
                // Сохраняем данные о доставке в sessionStorage
                const deliveryData = {
                    deliveryMethod: 'courier',
                    courierAddress: address.trim(),
                    courierDate: selectedDate,
                    courierTime: selectedTime,
                };
                sessionStorage.setItem('deliveryData', JSON.stringify(deliveryData));
                
                // Сразу переходим к состоянию "Переходим..." без промежуточного состояния
                setSubmitting(false);
                setNavigating(true);
                
                // Небольшая задержка для показа состояния "Переходим..."
                setTimeout(() => {
                    router.push('/request/final');
                }, 500);
            } else {
                setSubmitting(false);
            }
        } catch (error) {
            console.error('Ошибка при сохранении выбора:', error);
            setSubmitting(false);
        }
    };

    const finalPrice = price || 48000;

    // Функция для формирования полной модели
    const getFullModelName = (): string => {
        if (typeof window !== 'undefined') {
            const savedPhoneSelection = sessionStorage.getItem('phoneSelection');
            if (savedPhoneSelection) {
                try {
                    const parsed = JSON.parse(savedPhoneSelection);
                    let fullModel = `iPhone ${parsed.model}`;

                    if (parsed.variant) {
                        fullModel += ` ${parsed.variant}`;
                    }

                    if (parsed.storage) {
                        fullModel += ` ${parsed.storage}`;
                    }

                    if (parsed.color) {
                        const colorMap: { [key: string]: string } = {
                            'G': 'Золотой',
                            'R': 'Красный',
                            'Bl': 'Синий',
                            'Wh': 'Белый',
                            'C': 'Черный'
                        };
                        const colorLabel = colorMap[parsed.color] || parsed.color;
                        fullModel += ` ${colorLabel}`;
                    }

                    if (parsed.simType) {
                        fullModel += ` ${parsed.simType}`;
                    }

                    if (parsed.country) {
                        fullModel += ` ${parsed.country.split(' ')[0]}`;
                    }

                    return fullModel;
                } catch (e) {
                    console.error('Error parsing phoneSelection:', e);
                }
            }
        }

        const cleanModelName = modelname ? modelname.replace(/^Apple\s+/, '') : 'Модель не найдена';
        return cleanModelName;
    };

    const isFormValid = locationMethod && address.trim() && selectedDate && selectedTime;

    return (
        <Page back={true}>
            <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
                <div className="flex-1 p-3 pt-2 flex items-center justify-center">
                    <div className="w-full max-w-md mx-auto flex flex-col gap-6 pb-4">
                        {/* Заголовок */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-center"
                        >
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                Вызов мастера
                            </h2>
                            <p className="text-gray-600">
                                Укажите адрес и удобное время
                            </p>
                        </motion.div>

                        {/* Краткая информация о заявке */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
                        >
                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-600">Ваше устройство:</p>
                                <p className="font-semibold text-gray-900">{getFullModelName()}</p>
                                <p className="text-sm text-gray-600">Предварительная цена: <span className="font-semibold text-green-600">{finalPrice.toLocaleString()} ₽</span></p>
                            </div>
                        </motion.div>

                        {/* Форма заказа мастера */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Выбор способа указания адреса */}
                            {!locationMethod && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
                                >
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Как указать адрес?
                                    </label>
                                    <div className="space-y-3">
                                        <Button
                                            onClick={handleRequestLocation}
                                            disabled={isRequestingLocation}
                                            className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-medium py-4 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <MapPinIcon className="w-5 h-5" />
                                            <span>{isRequestingLocation ? 'Получаем локацию...' : 'Указать текущее местоположение'}</span>
                                        </Button>
                                        <p className="text-xs text-gray-500 text-center">
                                            * Работает только в Telegram приложении
                                        </p>
                                        
                                        <Button
                                            onClick={() => setLocationMethod('manual')}
                                            variant="outline"
                                            className="w-full border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium py-4 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 active:scale-95"
                                        >
                                            <MapPinIcon className="w-5 h-5" />
                                            <span>Ввести адрес вручную</span>
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Адрес */}
                            {locationMethod && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Адрес для мастера
                                        </label>
                                        <Button
                                            onClick={() => {
                                                setLocationMethod(null);
                                                setAddress('');
                                            }}
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-1 transition-all duration-200 active:scale-95"
                                        >
                                            Изменить
                                        </Button>
                                    </div>
                                    
                                    {locationMethod === 'telegram' && (
                                        <div className="mb-3 p-3 bg-[#2dc2c6]/10 rounded-xl border border-[#2dc2c6]/20">
                                            <div className="flex items-center space-x-2 text-sm text-[#2dc2c6]">
                                                <MapPinIcon className="w-4 h-4" />
                                                <span className="font-medium">Адрес получен автоматически</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Введите полный адрес с подъездом и квартирой"
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2dc2c6] focus:border-[#2dc2c6] outline-none transition-all duration-200 text-sm resize-none bg-white hover:border-gray-300"
                                        rows={3}
                                    />
                                </motion.div>
                            )}

                            {/* Дата и время */}
                            <div className="bg-white rounded-2xl mx-auto w-full p-4 border border-gray-200 shadow-sm">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Дата и время вызова мастера
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Дата */}
                                    <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-medium border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 rounded-xl py-3 px-4 transition-all duration-200 active:scale-95"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                <span className={selectedDate ? "text-gray-900" : "text-gray-500"} style={{ fontSize: '0.875rem' }}>
                                                    {selectedDate ? format(selectedDate, "dd MMM", { locale: ru }) : "Дата"}
                                                </span>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="center" side="top">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={(date) => {
                                                    // Если дата не undefined, обновляем выбранную дату
                                                    if (date) {
                                                        setSelectedDate(date);
                                                    }
                                                    setShowCalendar(false);
                                                    // Не сбрасываем время при смене даты - пользователь может изменить дату без потери времени
                                                }}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                defaultMonth={new Date()}
                                                initialFocus
                                                showOutsideDays={false}
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    {/* Время */}
                                    <Popover open={showTimePicker} onOpenChange={setShowTimePicker}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-medium border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 rounded-xl py-3 px-4 transition-all duration-200 active:scale-95"
                                                disabled={!selectedDate}
                                            >
                                                <ClockIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                <span className={selectedTime ? "text-gray-900" : "text-gray-500"} style={{ fontSize: '0.875rem' }}>
                                                    {selectedTime || "Время"}
                                                </span>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="center" side="top" className="w-[90vw] max-w-md">
                                            <div className="p-4">
                                                <h4 className="font-medium text-gray-900 mb-2 text-center">Выберите время</h4>
                                                <p className="text-xs text-gray-500 mb-4 text-center">
                                                    ⏰ Учитывается время на дорогу и работу мастера (минимум 2 часа между заявками)
                                                </p>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {availableTimes.map((time) => (
                                                        <Button
                                                            key={time}
                                                            onClick={() => {
                                                                setSelectedTime(time);
                                                                setShowTimePicker(false);
                                                            }}
                                                            variant={selectedTime === time ? "default" : "outline"}
                                                            className={`text-sm py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                                                                selectedTime === time 
                                                                    ? 'bg-[#2dc2c6] hover:bg-[#25a8ac] text-white shadow-sm active:scale-95' 
                                                                    : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 active:scale-95'
                                                            }`}
                                                        >
                                                            {time}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Подсказка о возможности изменения */}
                            {selectedDate && selectedTime && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-center"
                                >
                                    <p className="text-xs text-gray-500">
                                        💡 Чтобы изменить дату или время, просто выберите другие значения выше
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Кнопка подтверждения */}
                        {isFormValid && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting || navigating}
                                    className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold text-lg py-4 rounded-2xl transition-all duration-200 hover:shadow-lg shadow-md disabled:opacity-50"
                                >
                                    {submitting ? 'Сохраняем...' : navigating ? 'Переходим...' : 'Вызвать мастера'}
                                </Button>
                            </motion.div>
                        )}

                        {/* Кнопка "Привезу сам" */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            className="space-y-3"
                        >
                            <Button
                                onClick={() => router.push('/request/delivery-options')}
                                variant="outline"
                                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium text-base py-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                Изменить способ доставки
                            </Button>
                            
                            <Button
                                onClick={() => router.push('/request/pickup-points')}
                                variant="outline"
                                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium text-base py-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                Привезу сам
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default CourierBookingPage;
