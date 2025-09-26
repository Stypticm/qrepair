'use client'

import { useState, useEffect, useCallback } from 'react'
import { Page } from '@/components/Page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react'

interface MarketPrice {
  id: string
  source: string
  price: number
  url?: string
  title?: string
  description?: string
  location?: string
  condition?: string
  sellerType?: string
  parsedAt: string
  device: {
    id: string
    model: string
    variant: string
    storage: string
    color: string
    basePrice: number
  }
}

interface GroupedPrice {
  device: {
    id: string
    model: string
    variant: string
    storage: string
    color: string
    basePrice: number
  }
  prices: MarketPrice[]
  averagePrice: number
  minPrice: number
  maxPrice: number
  sources: string[]
}

export default function MarketPricesPage() {
  const [prices, setPrices] = useState<GroupedPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>('all')
  const [availableModels, setAvailableModels] = useState<string[]>([])

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const url = selectedModel === 'all'
        ? '/api/admin/market-prices'
        : `/api/admin/market-prices?model=${selectedModel}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setPrices(data.data)
      } else {
        setError(data.error || 'Ошибка загрузки данных')
      }
    } catch (error) {
      console.error('Error fetching prices:', error)
      setError('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }, [selectedModel])

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/devices/models')
        const data = await response.json()
        if (data.success) {
          setAvailableModels(data.models)
        }
      } catch (error) {
        console.error('Error fetching models:', error)
      }
    }

    fetchPrices()
    fetchModels()
  }, [selectedModel, fetchPrices])

  const getPriceDifference = (ourPrice: number, marketPrice: number) => {
    const difference = ((marketPrice - ourPrice) / ourPrice) * 100
    return {
      percentage: Math.round(difference),
      isHigher: difference > 0,
      isLower: difference < 0
    }
  }

  const getStatusColor = (ourPrice: number, marketPrice: number) => {
    const diff = getPriceDifference(ourPrice, marketPrice)

    if (diff.percentage > 20) return 'text-red-600 bg-red-50'
    if (diff.percentage < -20) return 'text-green-600 bg-green-50'
    return 'text-yellow-600 bg-yellow-50'
  }

  const getStatusText = (ourPrice: number, marketPrice: number) => {
    const diff = getPriceDifference(ourPrice, marketPrice)

    if (diff.percentage > 20) return 'Дорого'
    if (diff.percentage < -20) return 'Дешево'
    return 'Нормально'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Page back={true}>
        <div className="min-h-screen bg-white p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Загрузка данных...</span>
            </div>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page back={true}>
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-6xl mx-auto pt-16">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 text-center">
                  Рыночные цены
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Сохраненные данные парсинга цен
                </p>
              </div>
              <Button
                onClick={fetchPrices}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
            </div>
          </div>

          {/* Filter */}
          <Card className="mb-6 border-2 border-gray-600">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedModel('all')}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedModel === 'all'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                >
                  Все модели ({prices.length})
                </button>
                {availableModels.map((model) => {
                  const modelCount = prices.filter(p => p.device.model === model).length
                  return (
                    <button
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedModel === model
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                    >
                      iPhone {model} ({modelCount})
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Card className="mb-6 border-2 border-red-600 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Prices Table */}
          {prices.length === 0 ? (
            <Card className="border-2 border-gray-600">
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">Нет сохраненных данных о ценах</p>
                <p className="text-sm text-gray-400">
                  Запустите парсинг цен, чтобы увидеть данные здесь
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {prices.map((group, index) => (
                <div key={index}>
                  <Card className="border-2 border-gray-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            iPhone {group.device.model} {group.device.variant} {group.device.storage} {group.device.color}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {group.prices.length} цен
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs">
                            {group.sources.join(', ')}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      {/* Summary */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Наша цена</p>
                          <p className="text-lg font-bold text-gray-900">
                            {group.device.basePrice.toLocaleString()} ₽
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Средняя рыночная</p>
                          <p className="text-lg font-bold text-gray-900">
                            {group.averagePrice.toLocaleString()} ₽
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Диапазон</p>
                          <p className="text-sm font-medium text-gray-900">
                            {group.minPrice.toLocaleString()} - {group.maxPrice.toLocaleString()} ₽
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Статус</p>
                          <Badge className={`text-xs ${getStatusColor(group.device.basePrice, group.averagePrice)}`}>
                            {getStatusText(group.device.basePrice, group.averagePrice)}
                          </Badge>
                        </div>
                      </div>

                      {/* Individual Prices - Compact Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th className="text-left py-2 px-3 font-medium text-gray-700">Источник</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-700">Цена</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-700">Разница</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-700">Местоположение</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-700">Состояние</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-700">Продавец</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-700">Дата</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.prices.map((price, priceIndex) => {
                              const diff = getPriceDifference(group.device.basePrice, price.price)
                              return (
                                <tr key={priceIndex} className="border-b border-gray-200 hover:bg-gray-50">
                                  <td className="py-2 px-3">
                                    <Badge variant="outline" className="text-xs">
                                      {price.source}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-3 font-medium text-gray-900">
                                    {price.price.toLocaleString()} ₽
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="flex items-center gap-1">
                                      {diff.isHigher ? (
                                        <ArrowUpRight className="h-3 w-3 text-red-500" />
                                      ) : diff.isLower ? (
                                        <ArrowDownRight className="h-3 w-3 text-green-500" />
                                      ) : null}
                                      <span className={`text-xs px-2 py-1 rounded ${diff.isHigher ? 'bg-red-100 text-red-700' :
                                          diff.isLower ? 'bg-green-100 text-green-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {diff.percentage > 0 ? '+' : ''}{diff.percentage}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-gray-600">
                                    {price.location || '-'}
                                  </td>
                                  <td className="py-2 px-3 text-gray-600">
                                    {price.condition || '-'}
                                  </td>
                                  <td className="py-2 px-3 text-gray-600">
                                    {price.sellerType || '-'}
                                  </td>
                                  <td className="py-2 px-3 text-gray-500 text-xs">
                                    {formatDate(price.parsedAt)}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                  {index < prices.length - 1 && (
                    <div className="h-4 border-b-2 border-gray-300 mx-4"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  )
}
