'use client'

import { useFormData } from '@/hooks/usePersistentState'
import { Button } from '@/components/ui/button'
import { memo, useCallback, useMemo } from 'react'

// Типы для безопасности
interface DeviceCondition {
  front: string | null
  back: string | null
  side: string | null
  faceId?: string | null
  touchId?: string | null
  backCamera?: string | null
  battery?: string | null
}

interface WearValues {
  display_front: number
  display_back: number
  back_camera: number
  battery: number
}

/**
 * Debug компонент для разработки - НЕ для продакшена
 * Показывает состояние персистентности данных
 */
export const DataPersistenceDemo = memo(function DataPersistenceDemo() {
  const {
    phoneSelection,
    deviceConditions,
    wearValues,
    imei,
    serialNumber,
    price,
    priceRange,
    saveToDatabase,
    resetAll,
    isLoading
  } = useFormData()

  // Мемоизированные обработчики
  const handleSave = useCallback(async () => {
    try {
      await saveToDatabase()
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    }
  }, [saveToDatabase])

  const handleReset = useCallback(() => {
    if (confirm('Вы уверены, что хотите сбросить все данные?')) {
      resetAll()
    }
  }, [resetAll])

  // Мемоизированные данные для рендера
  const deviceConditionsEntries = useMemo(() => {
    return Object.entries(deviceConditions.state as DeviceCondition)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => ({ key, value: value as string }))
  }, [deviceConditions.state])

  const wearValuesEntries = useMemo(() => {
    return Object.entries(wearValues.state as WearValues)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({ key, value: value as number }))
  }, [wearValues.state])

  if (isLoading) {
    return (
      <div className="p-3 bg-blue-50 rounded-xl">
        <p className="text-blue-600 text-sm">🔄 Загрузка данных...</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          🐛 Debug: Состояние данных
        </h3>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
          DEV ONLY
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-3 text-sm">
        {/* Основные данные */}
        <div className="bg-white p-3 rounded-lg border">
          <h4 className="font-medium text-gray-700 mb-2">📱 Основные данные:</h4>
          <div className="space-y-1 text-gray-600">
            <div>Модель: <span className="font-medium">{phoneSelection.state.model}</span></div>
            <div>IMEI: <span className="font-medium">{imei.state || 'Не указан'}</span></div>
            <div>S/N: <span className="font-medium">{serialNumber.state || 'Не указан'}</span></div>
          </div>
        </div>

        {/* Цены */}
        <div className="bg-white p-3 rounded-lg border">
          <h4 className="font-medium text-gray-700 mb-2">💰 Цены:</h4>
          <div className="space-y-1 text-gray-600">
            <div>Цена: <span className="font-medium text-green-600">
              {price.state ? `${price.state.toLocaleString()} ₽` : 'Не рассчитана'}
            </span></div>
            {priceRange.state && (
              <div>Диапазон: <span className="font-medium text-blue-600">
                {priceRange.state.min.toLocaleString()} - {priceRange.state.max.toLocaleString()} ₽
              </span></div>
            )}
          </div>
        </div>

        {/* Состояние устройства */}
        {deviceConditionsEntries.length > 0 && (
          <div className="bg-white p-3 rounded-lg border">
            <h4 className="font-medium text-gray-700 mb-2">🔧 Состояние устройства:</h4>
            <div className="space-y-1 text-gray-600">
              {deviceConditionsEntries.map(({ key, value }) => (
                <div key={key}>
                  {key}: <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Оценка износа */}
        {wearValuesEntries.length > 0 && (
          <div className="bg-white p-3 rounded-lg border">
            <h4 className="font-medium text-gray-700 mb-2">📊 Оценка износа:</h4>
            <div className="space-y-1 text-gray-600">
              {wearValuesEntries.map(({ key, value }) => (
                <div key={key}>
                  {key}: <span className="font-medium">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Кнопки действий */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <Button 
          onClick={handleSave}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          💾 Сохранить в БД
        </Button>
        <Button 
          onClick={handleReset}
          size="sm"
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          🗑️ Сбросить все
        </Button>
      </div>
      
      {/* Статус системы */}
      <div className="text-xs text-gray-500 bg-green-50 p-2 rounded">
        <div className="flex items-center gap-1">
          <span>✅</span>
          <span>Автосохранение активно</span>
        </div>
        <div className="flex items-center gap-1">
          <span>✅</span>
          <span>Данные персистентны</span>
        </div>
      </div>
    </div>
  )
})
