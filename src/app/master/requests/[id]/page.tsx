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
import { CameraWithOverlay } from '@/components/CameraWithOverlay/CameraWithOverlay'

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
  const [isCameraOpen, setCameraOpen] = useState(false)
  const [currentPhotoId, setCurrentPhotoId] = useState<string | null>(null)

  // Сохраняем шаг в localStorage
  const saveStepToStorage = (step: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`master_step_${requestId}`, step.toString())
    }
  }

  // Загружаем шаг из localStorage
  const loadStepFromStorage = () => {
    if (typeof window !== 'undefined' && requestId) {
      const savedStep = localStorage.getItem(`master_step_${requestId}`)
      if (savedStep) {
        return parseInt(savedStep, 10)
      }
    }
    return 1
  }

  const { telegramId, initializeTelegram } = useAppStore()

  // Инициализация Telegram при загрузке страницы
  useEffect(() => {
    console.log('🔍 Master page - initializing Telegram...')
    initializeTelegram()
  }, [initializeTelegram])

  // Отладочная информация о telegramId
  useEffect(() => {
    console.log('🔍 Master page - telegramId:', telegramId)
    if (!telegramId) {
      console.log('❌ Master page - no telegramId, stopping loading')
    } else {
      console.log('✅ Master page - telegramId found:', telegramId)
    }
  }, [telegramId])

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
      // Загружаем сохраненный шаг
      const savedStep = loadStepFromStorage()
      setCurrentStep(savedStep)
    }
  }, [requestId])

  const fetchRequest = async () => {
    if (!requestId) return

    try {
      setLoading(true)
      console.log('🔍 Fetching request:', requestId)

      const response = await fetch(`/api/master/request/${requestId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch request')
      }

      console.log('🔍 Request data received:', data.request)
      setRequest(data.request)
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

  const openCamera = (photoId: string) => {
    setCurrentPhotoId(photoId)
    setCameraOpen(true)
  }

  const handlePhotoCapture = (blob: Blob) => {
    if (currentPhotoId) {
      const file = new File([blob], `${currentPhotoId}.jpg`, { type: 'image/jpeg' })
      setPhotoUploads(prev => prev.map(photo =>
        photo.id === currentPhotoId
          ? { ...photo, file, uploaded: false }
          : photo
      ))
    }
    setCameraOpen(false)
    setCurrentPhotoId(null)
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
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      saveStepToStorage(newStep)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      saveStepToStorage(newStep)
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
    <Page back={false}>
      {isCameraOpen ? (
        <div className="fixed inset-0 bg-black z-50">
          <CameraWithOverlay
            onPhotoCapture={handlePhotoCapture}
            overlayImage="front_master.png"
          />
          <Button
            onClick={() => setCameraOpen(false)}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-12 h-12 p-0"
            variant="ghost"
          >
            <X className="w-8 h-8" />
          </Button>
        </div>
      ) : (
        <div className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto pt-16">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sf-pro">Вторичная оценка</h1>
              <p className="text-gray-600 mb-4">Заявка #{request.id}</p>
              <div className="flex justify-center">
                <Badge
                  variant={request.status === 'completed' ? 'default' : 'outline'}
                  className={
                    request.status === 'completed'
                      ? 'bg-green-500 text-white border-green-500 px-4 text-sm font-semibold'
                      : request.status === 'paid'
                        ? 'bg-blue-500 text-white border-blue-500 px-4 text-sm font-semibold'
                        : request.status === 'inspected'
                          ? 'bg-yellow-500 text-white border-yellow-500 px-4 text-sm font-semibold'
                          : 'bg-orange-500 text-white border-orange-500 px-4 text-sm font-semibold'
                  }
                >
                  {request.status === 'inspected' && 'Проверена'}
                  {request.status === 'paid' && 'Оплачена'}
                  {request.status === 'completed' && 'Завершена'}
                  {!['inspected', 'paid', 'completed'].includes(request.status) && 'В процессе'}
                </Badge>
              </div>
            </div>

            <div className="h-full py-2 flex flex-col gap-2">
              {/* Информация о клиенте - компактно */}
              <Card className="border-2 border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 text-center">Данные клиента</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    {/* Устройство - на отдельной строке */}
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">Устройство</p>
                      <p className="font-medium text-gray-900 text-lg break-words">{request.modelname}</p>
                    </div>

                    {/* Остальная информация в grid */}
                    <div className="grid grid-cols-2 gap-4">
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
                              <p className={`text-sm ${photo.uploaded
                                ? 'text-green-600 font-semibold'
                                : photo.file
                                  ? 'text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded-md'
                                  : 'text-gray-500'
                                }`}>
                                {photo.uploaded ? '✅ Загружено' : photo.file ? '📸 Готово к загрузке' : '❌ Не выбрано'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {photo.uploaded ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : photo.file ? (
                              <div className="flex items-center gap-2">
                                <img src={URL.createObjectURL(photo.file)} alt="preview" className="w-16 h-16 rounded-md object-cover" />
                                <Button onClick={() => openCamera(photo.id)} variant="outline" size="sm">Переснять</Button>
                              </div>
                            ) : (
                              <Button onClick={() => openCamera(photo.id)} className="flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                <span>Сделать фото</span>
                              </Button>
                            )}
                          </div>                      </div>
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
                              <div className="w-12 h-12 flex items-center justify-center mr-4">
                                <IconComponent className="w-10 h-10 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{test.name}</p>
                                <p className="text-sm text-gray-500">{test.description}</p>
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
                        onClick={() => {
                          const confirmed = confirm('Рассчитать итоговую цену на основе результатов проверки?')
                          if (confirmed) {
                            calculateFinalPrice()
                            alert('Цена рассчитана! Переходим к завершению проверки.')
                            // Автоматически переходим к шагу 4 (завершение)
                            setTimeout(() => {
                              setCurrentStep(4)
                              // Убеждаемся, что цена рассчитана
                              if (finalPrice === null) {
                                calculateFinalPrice()
                              }
                            }, 1000)
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                      >
                        💰 Рассчитать цену
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Предварительная цена:</span>
                        <span className="font-medium">{request.price.toLocaleString()} ₽</span>
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
                          <div className="space-y-3">
                            {/* Показываем итоговую цену */}
                            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                              <p className="text-sm text-gray-600 mb-2">Итоговая цена для клиента:</p>
                              <p className="text-2xl font-bold text-green-600">
                                {(() => {
                                  // Рассчитываем цену если не рассчитана
                                  if (finalPrice === null) {
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
                                    const calculatedPrice = Math.max(0, request.price - penaltyAmount)
                                    return calculatedPrice.toLocaleString()
                                  }
                                  return finalPrice.toLocaleString()
                                })()} ₽
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Озвучьте эту цену клиенту</p>
                            </div>

                            <Button
                              onClick={() => updateRequestStatus('paid')}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                            >
                              💳 Оплатить
                            </Button>
                          </div>
                        )}

                        {request.status === 'paid' && (
                          <Button
                            onClick={async () => {
                              await updateRequestStatus('completed')
                              // Переходим на страницу мастера
                              window.location.href = '/master/points'
                            }}
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


                        {/* Кнопка завершения проверки */}
                        {request.status === 'in_progress' && (
                          <div className="space-y-4">
                            {/* Показываем итоговую цену */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                              <p className="text-sm text-gray-600 mb-2">Итоговая цена для клиента:</p>
                              <p className="text-3xl font-bold text-blue-600">
                                {(() => {
                                  // Если finalPrice не рассчитан, рассчитываем его сейчас
                                  if (finalPrice === null) {
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
                                    const calculatedPrice = Math.max(0, request.price - penaltyAmount)
                                    return calculatedPrice.toLocaleString()
                                  }
                                  return finalPrice.toLocaleString()
                                })()} ₽
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Озвучьте эту цену клиенту</p>
                            </div>

                            <Button
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/master/request-status', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      requestId: request.id,
                                      status: 'inspected',
                                      masterTelegramId: telegramId
                                    })
                                  })

                                  const data = await response.json()

                                  if (!response.ok) {
                                    throw new Error(data.error || 'Failed to update status')
                                  }

                                  // Обновляем статус заявки локально
                                  setRequest(prev => prev ? { ...prev, status: 'inspected' } : prev)

                                  // Показываем уведомление
                                  alert('Проверка завершена! Заявка передана клиенту.')
                                } catch (error) {
                                  console.error('Error completing inspection:', error)
                                }
                              }}
                              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                            >
                              ✅ Проверка завершена
                            </Button>
                          </div>
                        )}

                        {/* Кнопка сохранения проверки (для других статусов) */}
                        {request.status !== 'in_progress' && request.status !== 'inspected' && request.status !== 'paid' && request.status !== 'completed' && (
                          <Button
                            onClick={saveInspection}
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                          >
                            {saving ? 'Сохраняем...' : 'Сохранить проверку'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </Page>
  )
}
