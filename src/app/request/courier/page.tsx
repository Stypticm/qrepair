'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Page } from '@/components/Page'
import { motion } from 'framer-motion'
import { getPictureUrl } from '@/core/lib/assets'

const CourierPage = () => {
    const router = useRouter()
    const { telegramId, modelname, price, setCurrentStep } = useAppStore()
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [selectedTime, setSelectedTime] = useState<string>('')
    const [address, setAddress] = useState<string>('')
    const [isNavigating, setIsNavigating] = useState(false)
    const [priceRange, setPriceRange] = useState<{ min: number; max: number; midpoint: number } | null>(null)

    // Устанавливаем текущий шаг при загрузке страницы
    useEffect(() => {
        setCurrentStep('courier')
    }, [setCurrentStep])

    // Восстанавливаем состояние из sessionStorage при загрузке
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCourierData = sessionStorage.getItem('courierData')
            if (savedCourierData) {
                try {
                    const parsed = JSON.parse(savedCourierData)
                    if (parsed.selectedDate) setSelectedDate(parsed.selectedDate)
                    if (parsed.selectedTime) setSelectedTime(parsed.selectedTime)
                    if (parsed.address) setAddress(parsed.address)
                } catch (e) {
                    console.error('Ошибка при восстановлении данных курьера:', e)
                    sessionStorage.removeItem('courierData')
                }
            }
            const savedPriceRange = sessionStorage.getItem('priceRange')
            if (savedPriceRange) {
                try {
                    const parsed = JSON.parse(savedPriceRange)
                    if (parsed && typeof parsed.min === 'number' && typeof parsed.max === 'number') {
                        setPriceRange(parsed)
                    }
                } catch (e) {
                    console.error('Ошибка при восстановлении priceRange:', e)
                }
            }
        }
    }, [])

    // Сохраняем состояние в sessionStorage при изменениях
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const courierData = { selectedDate, selectedTime, address }
            sessionStorage.setItem('courierData', JSON.stringify(courierData))
        }
    }, [selectedDate, selectedTime, address])

    const handleContinue = () => {
        if (!selectedDate || !selectedTime || !address.trim()) {
            alert('Пожалуйста, заполните все поля')
            return
        }
        
        setIsNavigating(true)
        // TODO: Сохранение данных курьера в БД
        setTimeout(() => router.push('/request/photos'), 200)
    }

    const finalPrice = price || priceRange?.midpoint || 48000
    const formattedRange = useMemo(() => {
        if (!priceRange) return null
        const fmt = (n: number) => n.toLocaleString('ru-RU')
        return `${fmt(priceRange.min)} — ${fmt(priceRange.max)} ₽`
    }, [priceRange])

    // Функция для формирования полной модели
    const getFullModelName = (): string => {
        if (typeof window !== 'undefined') {
            const savedPhoneSelection = sessionStorage.getItem('phoneSelection')
            if (savedPhoneSelection) {
                try {
                    const parsed = JSON.parse(savedPhoneSelection)
                    let fullModel = `iPhone ${parsed.model}`

                    if (parsed.variant) {
                        fullModel += ` ${parsed.variant}`
                    }

                    if (parsed.storage) {
                        fullModel += ` ${parsed.storage}`
                    }

                    if (parsed.color) {
                        const colorMap: { [key: string]: string } = {
                            'G': 'Золотой',
                            'R': 'Красный',
                            'Bl': 'Синий',
                            'Wh': 'Белый',
                            'C': 'Черный'
                        }
                        const colorLabel = colorMap[parsed.color] || parsed.color
                        fullModel += ` ${colorLabel}`
                    }

                    if (parsed.simType) {
                        fullModel += ` ${parsed.simType}`
                    }

                    if (parsed.country) {
                        fullModel += ` ${parsed.country.split(' ')[0]}`
                    }

                    return fullModel
                } catch (e) {
                    console.error('Error parsing phoneSelection:', e)
                }
            }
        }

        const cleanModelName = modelname ? modelname.replace(/^Apple\s+/, '') : 'Модель не найдена'
        return cleanModelName
    }

    // Генерируем доступные даты (сегодня + 7 дней)
    const availableDates = useMemo(() => {
        const dates = []
        const today = new Date()
        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            dates.push({
                value: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('ru-RU', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short' 
                })
            })
        }
        return dates
    }, [])

    // Временные слоты
    const timeSlots = [
        { value: '09:00', label: '09:00 - 12:00' },
        { value: '12:00', label: '12:00 - 15:00' },
        { value: '15:00', label: '15:00 - 18:00' },
        { value: '18:00', label: '18:00 - 21:00' }
    ]

    return (
        <Page back={true}>
            <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-4 overflow-hidden">
                <div className="flex-1 p-3 pt-2 flex items-center justify-center">
                    <div className="w-full max-w-md mx-auto flex flex-col gap-6 pb-4 items-center text-center">
                        {/* Заголовок */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-center"
                        >
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                Курьер заберет
                            </h2>
                            <p className="text-gray-600">
                                Курьер заберет устройство у вас домой
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
                                <p className="text-base text-gray-700">Ваше устройство:</p>
                                <p className="text-xl font-semibold text-gray-900">{getFullModelName()}</p>
                                <p className="text-lg text-gray-700">Диапазон цены: {formattedRange ? (
                                    <span className="font-semibold text-green-600">{formattedRange}</span>
                                ) : (
                                    <span className="text-gray-500">уточняется</span>
                                )}
                                </p>
                            </div>
                        </motion.div>

                        {/* Форма выбора времени и адреса */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="w-full bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
                        >
                            <div className="space-y-4">
                                {/* Выбор даты - без лейбла */}
                                <div className="relative">
                                    <select
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium appearance-none bg-white"
                                    >
                                        <option value="">📅 Выберите дату</option>
                                        {availableDates.map((date) => (
                                            <option key={date.value} value={date.value}>
                                                {date.label}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Custom dropdown arrow */}
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Выбор времени - без лейбла */}
                                <div className="relative">
                                    <select
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium appearance-none bg-white"
                                    >
                                        <option value="">🕐 Выберите время</option>
                                        {timeSlots.map((slot) => (
                                            <option key={slot.value} value={slot.value}>
                                                {slot.label}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Custom dropdown arrow */}
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Адрес - без лейбла */}
                                <div>
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="📍 Укажите полный адрес с подъездом и квартирой"
                                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium resize-none bg-white"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Кнопка продолжения */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                        >
                            <Button
                                onClick={handleContinue}
                                disabled={!selectedDate || !selectedTime || !address.trim()}
                                className="w-full bg-white hover:bg-gray-50 text-gray-800 hover:text-gray-900 py-4 rounded-2xl text-lg font-semibold shadow-xl border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Продолжить
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
            {isNavigating && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="flex flex-col items-center">
                        <img src={getPictureUrl('animation_running.gif') || '/animation_running.gif'} alt="Загрузка" width={192} height={192} className="object-contain rounded-2xl" />
                        <p className="mt-4 text-lg font-semibold text-gray-700">Сохраняем данные курьера…</p>
                    </div>
                </div>
            )}
        </Page>
    )
}

export default CourierPage
