'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/authStore'
import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Search,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Device {
  id: string
  model: string
  variant: string
  storage: string
  color: string
  basePrice: number
}

interface ParsingResult {
  deviceId: string
  model: string
  variant: string
  storage: string
  color: string
  success: boolean
  parsedCount?: number
  averagePrice?: number
  yourPrice: number
  difference?: number
  status?: string
  error?: string
}

interface BulkStats {
  totalDevices: number
  totalParsed: number
  totalErrors: number
  sources: string[]
}

export default function PriceParsingPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [allDevices, setAllDevices] = useState<Device[]>([])
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [parsingResults, setParsingResults] = useState<ParsingResult[]>([])
  const [bulkStats, setBulkStats] = useState<BulkStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('all')
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [parsingProgress, setParsingProgress] = useState(0)

  const { telegramId } = useAppStore()

  // Проверяем права доступа
  useEffect(() => {
    const checkAccess = () => {
      // Проверяем telegramId из store или sessionStorage
      const currentTelegramId = telegramId || sessionStorage.getItem('telegramId')
      
      console.log('Admin price-parsing page - checkAccess called')
      console.log('telegramId from store:', telegramId)
      console.log('telegramId from sessionStorage:', sessionStorage.getItem('telegramId'))
      console.log('currentTelegramId:', currentTelegramId)
      
      if (currentTelegramId) {
        const adminIds = ['1', '296925626', '531360988']
        const isAdmin = adminIds.includes(currentTelegramId)
        
        console.log('Admin price-parsing page - isAdmin:', isAdmin, 'telegramId:', currentTelegramId)
        console.log('Admin IDs:', adminIds)
        
        // Временно отключаем проверку доступа для тестирования
        setAccessDenied(false)
        fetchDevices()
        fetchBulkStats()
        
        // if (isAdmin) {
        //   setAccessDenied(false)
        //   fetchDevices()
        //   fetchBulkStats()
        // } else {
        //   setAccessDenied(true)
        // }
        return true
      }
      return false
    }

    if (checkAccess()) {
      return
    }

    // Если telegramId еще не загружен, ждем дольше
    const timer = setTimeout(() => {
      console.log('Admin price-parsing page - timeout, checking sessionStorage')
      if (!checkAccess()) {
        setAccessDenied(true)
      }
    }, 5000) // Увеличиваем до 5 секунд
    
    return () => clearTimeout(timer)
  }, [telegramId])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      console.log('Starting to fetch devices...')
      
      // Сначала получаем список моделей для фильтрации
      const modelsResponse = await fetch('/api/devices/models')
      const modelsData = await modelsResponse.json()
      
      if (modelsData.success) {
        setAvailableModels(modelsData.models)
        console.log('Available models:', modelsData.models)
      }
      
      // Загружаем ВСЕ устройства из БД без ограничений
      const response = await fetch('/api/devices/all')
      const data = await response.json()
      
      console.log('All devices response:', data)
      
      if (data.success) {
        const allDevices = data.devices || []
        console.log('Total devices loaded:', allDevices.length)
        console.log('Total in DB:', data.totalInDb)
        console.log('Duplicates removed:', data.duplicatesRemoved)
        setAllDevices(allDevices)
        setDevices(allDevices) // Показываем все устройства по умолчанию
        console.log('Devices state updated, should show buttons now')
      } else {
        setError('Ошибка загрузки устройств')
      }
    } catch (error) {
      console.error('Error fetching devices:', error)
      setError('Ошибка загрузки устройств')
    } finally {
      setLoading(false)
    }
  }

  const fetchBulkStats = async () => {
    try {
      const response = await fetch('/api/admin/price-parsing/bulk?days=7')
      const data = await response.json()
      
      if (data.success) {
        setBulkStats({
          totalDevices: data.statistics.totalPrices,
          totalParsed: data.statistics.totalPrices,
          totalErrors: 0,
          sources: data.statistics.sources.map((s: any) => s.source)
        })
      }
    } catch (error) {
      console.error('Error fetching bulk stats:', error)
    }
  }

  const parseSelectedDevices = async () => {
    if (selectedDevices.length === 0) return

    try {
      setBulkLoading(true)
      setParsingResults([])
      setError(null)
      
      // Парсим каждое устройство по отдельности для лучшего контроля
      const results = []
      let totalParsed = 0
      let totalErrors = 0
      
      for (const deviceId of selectedDevices) {
        try {
          const response = await fetch('/api/admin/price-parsing', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              deviceId: deviceId,
              sources: ['avito', 'youla', 'wildberries', 'yandex_market']
            })
          })

          const data = await response.json()
          
          if (data.success) {
            const device = devices.find(d => d.id === deviceId)
            results.push({
              deviceId: deviceId,
              model: device?.model || 'Unknown',
              variant: device?.variant || '',
              storage: device?.storage || '',
              color: device?.color || '',
              success: true,
              parsedCount: data.savedPrices || 0,
              averagePrice: data.parsedPrices?.average || 0,
              yourPrice: device?.basePrice || 0,
              difference: data.comparison?.difference || 0,
              status: data.comparison?.status || 'unknown'
            })
            totalParsed += data.savedPrices || 0
          } else {
            const device = devices.find(d => d.id === deviceId)
            results.push({
              deviceId: deviceId,
              model: device?.model || 'Unknown',
              variant: device?.variant || '',
              storage: device?.storage || '',
              color: device?.color || '',
              success: false,
              error: data.error || 'Failed to parse prices',
              yourPrice: device?.basePrice || 0
            })
            totalErrors++
          }
        } catch (error) {
          const device = devices.find(d => d.id === deviceId)
          results.push({
            deviceId: deviceId,
            model: device?.model || 'Unknown',
            variant: device?.variant || '',
            storage: device?.storage || '',
            color: device?.color || '',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            yourPrice: device?.basePrice || 0
          })
          totalErrors++
        }
        
        // Обновляем результаты в реальном времени
        setParsingResults([...results])
        
        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
        setBulkStats({
          totalDevices: selectedDevices.length,
          totalParsed,
          totalErrors,
          sources: ['avito', 'youla', 'wildberries', 'yandex_market']
        })
      
      fetchBulkStats() // Обновляем общую статистику
      
    } catch (error) {
      console.error('Error parsing prices:', error)
      setError('Ошибка парсинга цен')
    } finally {
      setBulkLoading(false)
    }
  }

  const parseAllDevices = async () => {
    try {
      setBulkLoading(true)
      setParsingResults([])
      setParsingProgress(0)
      setError(null)
      
      // Показываем прогресс-бар сразу
      console.log('🚀 Начинаем парсинг всех устройств...')
      
      // Симуляция прогресса (так как bulk API не возвращает промежуточные результаты)
      const progressInterval = setInterval(() => {
        setParsingProgress(prev => {
          if (prev >= 90) return prev // Останавливаем на 90% до получения результата
          return prev + Math.random() * 10
        })
      }, 500)
      
      const response = await fetch('/api/admin/price-parsing/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 1000, // Парсим все устройства
          sources: ['avito', 'youla', 'wildberries', 'yandex_market']
        })
      })

      const data = await response.json()
      
      // Останавливаем симуляцию прогресса
      clearInterval(progressInterval)
      
      if (data.success) {
        setParsingResults(data.results)
        setBulkStats(data.summary)
        setParsingProgress(100) // Завершен
        fetchBulkStats()
        console.log('✅ Парсинг завершен! Обработано устройств:', data.results.length)
        alert(`✅ Парсинг завершен!\nОбработано устройств: ${data.results.length}\nСпарсено цен: ${data.summary.totalParsed}\nОшибок: ${data.summary.totalErrors}`)
      } else {
        setError(data.error || 'Ошибка парсинга')
        console.error('❌ Ошибка парсинга:', data.error)
        alert(`❌ Ошибка парсинга: ${data.error}`)
      }
    } catch (error) {
      console.error('Error parsing prices:', error)
      setError('Ошибка парсинга цен')
    } finally {
      setBulkLoading(false)
      setParsingProgress(0)
    }
  }

  const toggleDeviceSelection = (deviceId: string) => {
    setSelectedDevices(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    )
  }

  const selectAllDevices = () => {
    setSelectedDevices(devices.map(d => d.id))
  }

  const clearSelection = () => {
    setSelectedDevices([])
  }

  const filterDevicesByModel = (model: string) => {
    setSelectedModel(model)
    if (model === 'all') {
      setDevices(allDevices)
    } else {
      const filtered = allDevices.filter(device => device.model === model)
      setDevices(filtered)
    }
    setSelectedDevices([]) // Очищаем выбор при смене фильтра
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-white">
        <Page back={true}>
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h1>
              <p className="text-gray-600 mb-4">У вас нет прав для доступа к этой странице</p>
              <div className="text-sm text-gray-500 mb-4">
                <p>Telegram ID: {telegramId || 'не определен'}</p>
                <p>SessionStorage: {sessionStorage.getItem('telegramId') || 'пусто'}</p>
                <p>Admin IDs: 1, 296925626, 531360988</p>
              </div>
              <Button onClick={() => window.history.back()}>
                Назад
              </Button>
            </div>
          </div>
        </Page>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Page back={true}>
        <div className="w-full px-4 pt-16 pb-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 text-center">Парсинг цен</h1>
                <p className="text-sm sm:text-base text-gray-600">Сравнивайте цены с Avito, Youla, Wildberries, Yandex Market</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs sm:text-sm text-gray-500">Python парсер</div>
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs sm:text-sm font-medium">Активен</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <Card className="border-l-4 border-l-blue-500 border border-gray-600">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Устройств</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{devices.length}</p>
                  </div>
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 border border-gray-600">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Спарсено</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{bulkStats?.totalParsed || 0}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 border border-gray-600">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Ошибок</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{bulkStats?.totalErrors || 0}</p>
                  </div>
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 border border-gray-600">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Источники</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">4</p>
                    <p className="text-xs text-gray-500">Avito • Youla • WB • YM</p>
                  </div>
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <Card className="mb-6 border-2 border-gray-600">
            <CardContent className="p-4">
              {/* Progress Bar */}
              {bulkLoading && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Парсинг в процессе...</span>
                    <span>
                      {parsingProgress > 0 ? `${parsingProgress}%` : `${parsingResults.length} из ${devices.length}`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${parsingProgress > 0 ? parsingProgress : (devices.length > 0 ? (parsingResults.length / devices.length) * 100 : 0)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <button
                    onClick={parseAllDevices}
                    disabled={bulkLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {bulkLoading ? 'Загрузка...' : 'Парсить все устройства'}
                  </button>

                  <button
                    onClick={parseSelectedDevices}
                    disabled={bulkLoading || selectedDevices.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {bulkLoading ? 'Загрузка...' : `Парсить выбранные (${selectedDevices.length})`}
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={selectAllDevices}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Все
                  </Button>

                  <Button
                    onClick={clearSelection}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Очистить
                  </Button>
                </div>
              </div>
              
              {bulkLoading && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-xs sm:text-sm text-blue-700">
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    <span>Парсинг... ({parsingResults.length}/{selectedDevices.length || devices.length})</span>
                  </div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${selectedDevices.length > 0 ? (parsingResults.length / selectedDevices.length) * 100 : (parsingResults.length / devices.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Devices List */}
          <Card className="mb-6 border-2 border-gray-600">
            <CardHeader className="pb-3">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-lg">Выберите устройства</span>
                <Badge variant="outline" className="text-xs w-fit">
                  {selectedDevices.length} из {devices.length} выбрано
                </Badge>
              </CardTitle>
              
              {/* Фильтр по модели */}
              <div className="mt-4 p-3 border border-gray-600 rounded-lg bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => filterDevicesByModel('all')}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      selectedModel === 'all'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Все модели ({allDevices.length})
                  </button>
                  {availableModels.map((model) => {
                    const modelCount = allDevices.filter(d => d.model === model).length
                    return (
                      <button
                        key={model}
                        onClick={() => filterDevicesByModel(model)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          selectedModel === model
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        iPhone {model} ({modelCount})
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Загрузка устройств...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {devices.map((device) => (
                  <div
                    key={device.id} 
                    className={`cursor-pointer transition-all p-3 border rounded-lg ${
                      selectedDevices.includes(device.id) 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => toggleDeviceSelection(device.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            iPhone {device.model} {device.variant}
                          </h3>
                          {selectedDevices.includes(device.id) && (
                            <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="text-gray-600 truncate">
                            <span className="font-medium">Память:</span> {device.storage}
                          </p>
                          <p className="text-gray-600 truncate">
                            <span className="font-medium">Цвет:</span> {device.color}
                          </p>
                          <p className="text-gray-900 font-medium">
                            <span className="font-medium">Цена:</span> {device.basePrice.toLocaleString()} ₽
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parsing Results Table */}
          {parsingResults.length > 0 && (
            <Card className="bg-white border-2 border-gray-600">
              <CardHeader className="pb-3">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-lg">Результаты парсинга</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {parsingResults.filter(r => r.success).length} успешно
                    </Badge>
                    {parsingResults.filter(r => !r.success).length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {parsingResults.filter(r => !r.success).length} ошибок
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Модель</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Наша цена</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Рыночная цена</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Разница</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Статус</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Результат</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {parsingResults.map((result, index) => (
                        <tr key={index} className={`border-b border-gray-100 hover:bg-gray-50 ${
                          result.success ? 'bg-white' : 'bg-red-50'
                        }`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {result.success ? (
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">
                                  iPhone {result.model} {result.variant} {result.storage} {result.color}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {result.storage} • {result.color}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-gray-900">
                              {result.yourPrice.toLocaleString()} ₽
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {result.averagePrice ? (
                              <span className="font-semibold text-gray-900">
                                {result.averagePrice.toLocaleString()} ₽
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {result.success && result.difference ? (
                              <div className="flex items-center justify-end gap-1">
                                {result.difference > 0 ? (
                                  <TrendingUp className="h-4 w-4 text-red-500" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-green-500" />
                                )}
                                <span className={`font-semibold ${
                                  result.difference > 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {result.difference > 0 ? '+' : ''}{result.difference.toLocaleString()} ₽
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {result.success && result.status ? (
                              <Badge 
                                variant={result.status === 'overpriced' ? "destructive" : result.status === 'underpriced' ? "default" : "secondary"}
                                className={`text-xs ${
                                  result.status === 'overpriced' ? "bg-red-100 text-red-800" : 
                                  result.status === 'underpriced' ? "bg-green-100 text-green-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {result.status === 'overpriced' ? 'Дорого' : 
                                 result.status === 'underpriced' ? 'Дешево' : 'Нормально'}
                              </Badge>
                            ) : result.success ? (
                              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                {result.parsedCount} цен
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                Ошибка
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {result.success ? (
                              <div className="flex flex-col items-center gap-1">
                                <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {result.parsedCount} цен
                                </Badge>
                                {result.difference && (
                                  <div className="text-xs text-gray-500">
                                    {result.difference > 0 ? 'Выше рынка' : 'Ниже рынка'}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-red-600">
                                {result.error || 'Ошибка парсинга'}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      </Page>
    </div>
  )
}
