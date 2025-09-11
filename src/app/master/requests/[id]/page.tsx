'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/authStore'
import { useMasterNotifications } from '@/hooks/useMasterNotifications'
import Link from 'next/link'
import { Page } from '@/components/Page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Camera, 
  Smartphone, 
  Battery, 
  Fingerprint,
  Eye,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react'

interface Request {
  id: string
  modelname: string
  price: number
  username: string
  status: string
  createdAt: string
  sn?: string
  deviceConditions?: any
  additionalConditions?: any
  aiAnalysis?: any
  photoUrls?: string[]
  phoneData?: any
  deviceData?: any
}

interface FunctionalityTest {
  id: string
  name: string
  description: string
  icon: any
  working: boolean | null
  penaltyPercent: number
  isNegative: boolean // true если "нет" означает что всё хорошо (например, нет сколов)
}

interface PhotoUpload {
  id: string
  label: string
  file: File | null
  uploaded: boolean
  url?: string
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function MasterRequestPage({ params }: PageProps) {
  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [finalPrice, setFinalPrice] = useState<number | null>(null)
  const [totalPenalty, setTotalPenalty] = useState(0)
  const [currentStep, setCurrentStep] = useState(1) // 1: фото, 2: тесты, 3: цена, 4: сохранение

  const { telegramId } = useAppStore()

  // Функциональные тесты
  const [functionalityTests, setFunctionalityTests] = useState<FunctionalityTest[]>([
    {
      id: 'power_button',
      name: 'Кнопка питания',
      description: 'Работает ли кнопка включения/выключения',
      icon: Smartphone,
      working: null,
      penaltyPercent: 5,
      isNegative: false
    },
    {
      id: 'volume_buttons',
      name: 'Кнопки громкости',
      description: 'Работают ли кнопки увеличения/уменьшения громкости',
      icon: Smartphone,
      working: null,
      penaltyPercent: 3,
      isNegative: false
    },
    {
      id: 'face_id',
      name: 'Face ID',
      description: 'Работает ли распознавание лица',
      icon: Eye,
      working: null,
      penaltyPercent: 8,
      isNegative: false
    },
    {
      id: 'touch_id',
      name: 'Touch ID',
      description: 'Работает ли сканер отпечатков пальцев',
      icon: Fingerprint,
      working: null,
      penaltyPercent: 8,
      isNegative: false
    },
    {
      id: 'back_camera',
      name: 'Задняя камера',
      description: 'Работает ли основная камера',
      icon: Camera,
      working: null,
      penaltyPercent: 10,
      isNegative: false
    },
    {
      id: 'front_camera',
      name: 'Фронтальная камера',
      description: 'Работает ли селфи камера',
      icon: Camera,
      working: null,
      penaltyPercent: 5,
      isNegative: false
    },
    {
      id: 'battery_health',
      name: 'Здоровье батареи',
      description: 'Батарея держит заряд нормально',
      icon: Battery,
      working: null,
      penaltyPercent: 15,
      isNegative: false
    },
    {
      id: 'screen_scratches',
      name: 'Царапины на экране',
      description: 'Есть ли заметные царапины на дисплее',
      icon: AlertTriangle,
      working: null,
      penaltyPercent: 5,
      isNegative: true // "нет" царапин = хорошо
    },
    {
      id: 'back_scratches',
      name: 'Царапины на задней панели',
      description: 'Есть ли заметные царапины на задней части',
      icon: AlertTriangle,
      working: null,
      penaltyPercent: 3,
      isNegative: true // "нет" царапин = хорошо
    }
  ])

  // Загрузка фотографий
  const [photoUploads, setPhotoUploads] = useState<PhotoUpload[]>([
    {
      id: 'front',
      label: 'Передняя часть',
      file: null,
      uploaded: false
    },
    {
      id: 'back',
      label: 'Задняя панель',
      file: null,
      uploaded: false
    },
    {
      id: 'side',
      label: 'Боковая грань',
      file: null,
      uploaded: false
    }
  ])

  // Включаем уведомления для мастеров
  useMasterNotifications()

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setRequestId(resolvedParams.id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (requestId) {
      fetchRequest()
    }
  }, [requestId])

  const fetchRequest = async () => {
    if (!requestId) return

    try {
      setLoading(true)
      // Здесь нужно создать API для получения конкретной заявки
      // Пока что используем заглушку
      const mockRequest: Request = {
        id: requestId,
        modelname: 'iPhone 15 Pro',
        price: 50000,
        username: 'test_user',
        status: 'submitted',
        createdAt: new Date().toISOString(),
        sn: 'ABC123456789',
        deviceConditions: {
          front: 'good',
          back: 'excellent',
          side: 'new'
        },
        additionalConditions: {
          faceId: true,
          touchId: true,
          backCamera: true,
          battery: 95
        }
      }

      setRequest(mockRequest)
    } catch (error) {
      console.error('Error fetching request:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, photoId: string) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhotoUploads(prev => prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, file, uploaded: false }
          : photo
      ))
    }
  }

  const uploadPhotos = async () => {
    if (photoUploads.some(photo => !photo.file)) {
      alert('Пожалуйста, загрузите все 3 фотографии')
      return
    }

    try {
      setUploading(true)
      const updatedUploads = [...photoUploads]

      for (let i = 0; i < photoUploads.length; i++) {
        const photo = photoUploads[i]
        if (photo.file) {
          const formData = new FormData()
          formData.append('photo', photo.file)
          formData.append('requestId', requestId!)
          formData.append('photoType', photo.id)

          const response = await fetch('/api/master/upload-photo', {
            method: 'POST',
            body: formData
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Failed to upload photo')
          }

          updatedUploads[i] = { ...photo, uploaded: true, url: data.photoUrl }
        }
      }

      setPhotoUploads(updatedUploads)
      alert('Все фотографии успешно загружены!')
      // Автоматически переходим к следующему шагу
      setTimeout(() => {
        setCurrentStep(2)
      }, 1000)
    } catch (error) {
      console.error('Error uploading photos:', error)
      alert('Ошибка при загрузке фотографий')
    } finally {
      setUploading(false)
    }
  }

  const updateFunctionalityTest = (testId: string, working: boolean) => {
    setFunctionalityTests(prev => prev.map(test => 
      test.id === testId ? { ...test, working } : test
    ))
  }

  const calculateFinalPrice = () => {
    if (!request) return

    let totalPenaltyPercent = 0
    
    functionalityTests.forEach(test => {
      if (test.working !== null) {
        const shouldApplyPenalty = test.isNegative ? !test.working : test.working === false
        if (shouldApplyPenalty) {
          totalPenaltyPercent += test.penaltyPercent
        }
      }
    })

    const penaltyAmount = (request.price * totalPenaltyPercent) / 100
    const calculatedFinalPrice = Math.max(0, request.price - penaltyAmount)
    
    setTotalPenalty(penaltyAmount)
    setFinalPrice(calculatedFinalPrice)
    
    // Если все тесты завершены, автоматически переходим к шагу с ценой
    if (functionalityTests.every(test => test.working !== null) && currentStep === 2) {
      setTimeout(() => {
        setCurrentStep(3)
      }, 500)
    }
  }

  const saveInspection = async () => {
    if (!request) return

    try {
      setSaving(true)
      
      // Рассчитываем финальную цену, если она еще не была рассчитана
      let calculatedFinalPrice = finalPrice
      let calculatedTotalPenalty = totalPenalty
      
      if (calculatedFinalPrice === null) {
        let totalPenaltyPercent = 0
        
        functionalityTests.forEach(test => {
          if (test.working !== null) {
            const shouldApplyPenalty = test.isNegative ? !test.working : test.working === false
            if (shouldApplyPenalty) {
              totalPenaltyPercent += test.penaltyPercent
            }
          }
        })

        calculatedTotalPenalty = (request.price * totalPenaltyPercent) / 100
        calculatedFinalPrice = Math.max(0, request.price - calculatedTotalPenalty)
      }
      
      const response = await fetch('/api/master/save-inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          masterTelegramId: telegramId,
          functionalityTests: functionalityTests.map(test => ({
            id: test.id,
            working: test.working,
            penaltyPercent: test.penaltyPercent,
            isNegative: test.isNegative
          })),
          finalPrice: calculatedFinalPrice,
          totalPenalty: calculatedTotalPenalty,
          photoUrls: photoUploads.filter(p => p.uploaded).map(p => p.url)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save inspection')
      }

      alert('Проверка успешно сохранена!')
      // Обновляем статус заявки
      await updateRequestStatus('inspected')
      // Обновляем локальное состояние
      if (request) {
        setRequest({ ...request, status: 'inspected' })
      }
    } catch (error) {
      console.error('Error saving inspection:', error)
      alert('Ошибка при сохранении проверки')
    } finally {
      setSaving(false)
    }
  }

  // Обновляем расчет цены при изменении тестов
  useEffect(() => {
    calculateFinalPrice()
  }, [functionalityTests, request])

  // Функции навигации между шагами
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // Фото
        return photoUploads.every(photo => photo.uploaded)
      case 2: // Тесты
        return functionalityTests.every(test => test.working !== null)
      case 3: // Цена
        return finalPrice !== null
      default:
        return true
    }
  }

  const updateRequestStatus = async (status: string) => {
    try {
      const response = await fetch('/api/master/request-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status,
          masterTelegramId: telegramId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status')
      }

      const statusMessages = {
        'inspected': 'проверена',
        'paid': 'отмечена как оплаченная',
        'completed': 'завершена'
      }
      
      alert(`Заявка ${statusMessages[status as keyof typeof statusMessages] || 'обновлена'}`)
      
      // Обновляем локальное состояние
      if (request) {
        setRequest({ ...request, status })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Ошибка при обновлении статуса')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загружаем заявку...</p>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ошибка: {error || 'Заявка не найдена'}</p>
          <Link
            href="/master/points"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Назад к точкам
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Page back={true}>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sf-pro">Вторичная оценка</h1>
              <p className="text-gray-600">Заявка #{request.id}</p>
              <div className="mt-2">
                <Badge 
                  variant={request.status === 'completed' ? 'default' : 'outline'}
                  className={
                    request.status === 'completed' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : request.status === 'paid'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : request.status === 'inspected'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }
                >
                  {request.status === 'inspected' && 'Проверена'}
                  {request.status === 'paid' && 'Оплачена'}
                  {request.status === 'completed' && 'Завершена'}
                  {!['inspected', 'paid', 'completed'].includes(request.status) && 'В процессе'}
                </Badge>
              </div>
            </div>
            <Link
              href="/master/points"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Назад
            </Link>
          </div>

          <div className="space-y-6">
            {/* Информация о клиенте - компактно */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Данные клиента</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Устройство</p>
                    <p className="font-medium text-gray-900">{request.modelname}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Клиент</p>
                    <p className="font-medium text-gray-900">@{request.username}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Предварительная цена</p>
                    <p className="font-medium text-gray-900">{request.price.toLocaleString()} ₽</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Создана</p>
                    <p className="font-medium text-gray-900">{new Date(request.createdAt).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Прогресс-бар */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">Прогресс проверки</span>
                  <span className="text-sm text-gray-500">{currentStep} из 4</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Фото</span>
                  <span>Тесты</span>
                  <span>Цена</span>
                  <span>Сохранение</span>
                </div>
              </CardContent>
            </Card>

            {/* Шаг 1: Загрузка фотографий */}
            {currentStep === 1 && (
              <Card className="border-2 border-gray-200 animate-in slide-in-from-right-5 duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Шаг 1: Фотографии устройства
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {photoUploads.map((photo, index) => (
                      <div key={photo.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{photo.label}</p>
                            <p className="text-sm text-gray-500">
                              {photo.uploaded ? 'Загружено' : photo.file ? 'Готово к загрузке' : 'Не выбрано'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {photo.uploaded ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoUpload(e, photo.id)}
                              className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      onClick={uploadPhotos}
                      disabled={uploading || photoUploads.some(photo => !photo.file)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {uploading ? 'Загружаем...' : 'Загрузить все фотографии'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Шаг 2: Проверка функционала */}
            {currentStep === 2 && (
              <Card className="border-2 border-gray-200 animate-in slide-in-from-right-5 duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Шаг 2: Проверка функционала
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {functionalityTests.map((test) => {
                      const IconComponent = test.icon
                      return (
                        <div key={test.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                          <div className="flex items-center">
                            <IconComponent className="w-5 h-5 text-gray-600 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">{test.name}</p>
                              <p className="text-sm text-gray-500">{test.description}</p>
                              <p className="text-xs text-gray-400">
                                Штраф: {test.penaltyPercent}% {test.isNegative && '(отрицательный)'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant={test.working === true ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateFunctionalityTest(test.id, true)}
                              className={test.working === true ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {test.isNegative ? 'Нет' : 'Да'}
                            </Button>
                            <Button
                              variant={test.working === false ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateFunctionalityTest(test.id, false)}
                              className={test.working === false ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              {test.isNegative ? 'Да' : 'Нет'}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Шаг 3: Расчет финальной цены */}
            {currentStep === 3 && (
              <Card className="border-2 border-blue-200 bg-blue-50 animate-in slide-in-from-right-5 duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                    <span>Шаг 3: Итоговая цена</span>
                    <Button
                      onClick={calculateFinalPrice}
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-gray-50"
                    >
                      Рассчитать
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Предварительная цена:</span>
                      <span className="font-medium">{request.price.toLocaleString()} ₽</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Штрафы ({totalPenalty > 0 ? Math.round((totalPenalty / request.price) * 100) : 0}%):</span>
                      <span className="font-medium text-red-600">-{totalPenalty.toLocaleString()} ₽</span>
                    </div>
                    <div className="border-t border-blue-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Финальная цена:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {finalPrice !== null ? finalPrice.toLocaleString() : request.price.toLocaleString()} ₽
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Шаг 4: Сохранение и управление статусом */}
            {currentStep === 4 && (
              <Card className="border-2 border-gray-200 animate-in slide-in-from-right-5 duration-300">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Проверка завершена</h3>
                      <p className="text-gray-600 text-sm">
                        Все проверки завершены. Выберите действие для заявки.
                      </p>
                    </div>
                    
                    {/* Кнопки управления статусом */}
                    <div className="space-y-3">
                      {request.status === 'inspected' && (
                        <Button
                          onClick={() => updateRequestStatus('paid')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                        >
                          💳 Оплатить
                        </Button>
                      )}
                      
                      {request.status === 'paid' && (
                        <Button
                          onClick={() => updateRequestStatus('completed')}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                        >
                          ✅ Завершить
                        </Button>
                      )}
                      
                      {request.status === 'completed' && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-green-800 font-medium">Заявка завершена</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Кнопка сохранения проверки (если еще не сохранена) */}
                      {request.status !== 'inspected' && request.status !== 'paid' && request.status !== 'completed' && (
                        <Button
                          onClick={saveInspection}
                          disabled={saving}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                        >
                          {saving ? 'Сохраняем...' : 'Сохранить проверку'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Навигация */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <Button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    variant="outline"
                    className="flex items-center"
                  >
                    <X className="w-4 h-4 mr-2 rotate-90" />
                    Назад
                  </Button>
                  
                  <Button
                    onClick={nextStep}
                    disabled={currentStep === 4 || !canProceedToNextStep()}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                  >
                    Далее
                    <X className="w-4 h-4 ml-2 -rotate-90" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Page>
  )
}
