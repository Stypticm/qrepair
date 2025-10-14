'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/stores/authStore'
import { CameraWithOverlay } from '@/components/CameraWithOverlay/CameraWithOverlay'
import { Page } from '@/components/Page'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
  X,
} from 'lucide-react'
import Link from 'next/link'

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
  pickupPoint?: string
}

interface FunctionalityTest {
  id: string
  name: string
  description: string
  icon: any
  working: boolean | null
  penaltyPercent: number
  isNegative: boolean // true when a negative answer ("No") means the device is fine
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

const MASTER_STEPS = [
  { id: 1, title: 'Фотографии', subtitle: 'Сделайте снимки устройства' },
  { id: 2, title: 'Проверка', subtitle: 'Функциональные тесты' },
  { id: 3, title: 'Оценка', subtitle: 'Расчёт стоимости' },
  { id: 4, title: 'Завершение', subtitle: 'Подтверждение результата' },
] as const

export default function MasterRequestPage({ params }: PageProps) {
  const router = useRouter()
  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [finalPrice, setFinalPrice] = useState<number | null>(null)
  const [totalPenalty, setTotalPenalty] = useState(0)
  const [currentStep, setCurrentStep] = useState(1) // шаги: 1 — фото, 2 — проверки, 3 — оценка, 4 — итог
  const [isCameraOpen, setCameraOpen] = useState(false)
  const [currentPhotoId, setCurrentPhotoId] = useState<string | null>(null)

  const { telegramId, initializeTelegram } = useAppStore()

  const saveStepToStorage = (step: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`master_step_${requestId}`, step.toString())
    }
  }

  const loadStepFromStorage = () => {
    if (typeof window !== 'undefined' && requestId) {
      const savedStep = localStorage.getItem(`master_step_${requestId}`)
      if (savedStep) {
        return parseInt(savedStep, 10)
      }
    }
    return 1
  }

  useEffect(() => {
    initializeTelegram()
  }, [initializeTelegram])

  const [functionalityTests, setFunctionalityTests] = useState<FunctionalityTest[]>([
    {
      id: 'power_button',
      name: 'Кнопка питания',
      description: 'Кнопка питания работает исправно',
      icon: Smartphone,
      working: null,
      penaltyPercent: 5,
      isNegative: false,
    },
    {
      id: 'volume_buttons',
      name: 'Кнопки громкости',
      description: 'Кнопки громкости работают исправно',
      icon: Smartphone,
      working: null,
      penaltyPercent: 3,
      isNegative: false,
    },
    {
      id: 'face_id',
      name: 'Face ID',
      description: 'Распознавание лица работает',
      icon: Eye,
      working: null,
      penaltyPercent: 8,
      isNegative: false,
    },
    {
      id: 'touch_id',
      name: 'Touch ID',
      description: 'Сканер отпечатка работает',
      icon: Fingerprint,
      working: null,
      penaltyPercent: 8,
      isNegative: false,
    },
    {
      id: 'back_camera',
      name: 'Основная камера',
      description: 'Основная камера снимает без проблем',
      icon: Camera,
      working: null,
      penaltyPercent: 10,
      isNegative: false,
    },
    {
      id: 'front_camera',
      name: 'Фронтальная камера',
      description: 'Фронтальная камера снимает без проблем',
      icon: Camera,
      working: null,
      penaltyPercent: 5,
      isNegative: false,
    },
    {
      id: 'battery_health',
      name: 'Состояние батареи',
      description: 'Батарея держит заряд',
      icon: Battery,
      working: null,
      penaltyPercent: 15,
      isNegative: false,
    },
    {
      id: 'screen_scratches',
      name: 'Царапины на экране',
      description: 'Видимые царапины на дисплее',
      icon: AlertTriangle,
      working: null,
      penaltyPercent: 5,
      isNegative: true,
    },
    {
      id: 'back_scratches',
      name: 'Царапины на корпусе',
      description: 'Видимые царапины на задней панели',
      icon: AlertTriangle,
      working: null,
      penaltyPercent: 3,
      isNegative: true,
    },
  ])

  const [photoUploads, setPhotoUploads] = useState<PhotoUpload[]>([
    {
      id: 'front',
      label: 'Передняя сторона',
      file: null,
      uploaded: false,
    },
    {
      id: 'back',
      label: 'Задняя сторона',
      file: null,
      uploaded: false,
    },
    {
      id: 'side',
      label: 'Боковая сторона',
      file: null,
      uploaded: false,
    },
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
      const savedStep = loadStepFromStorage()
      setCurrentStep(savedStep)
    }
  }, [requestId])

  const fetchRequest = async () => {
    if (!requestId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/master/request/${requestId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось получить заявку')
      }

      setRequest(data.request)
    } catch (error) {
      console.error('Error fetching request:', error)
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, photoId: string) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhotoUploads((prev) =>
        prev.map((photo) => (photo.id === photoId ? { ...photo, file, uploaded: false } : photo))
      )
    }
  }

  const uploadPhotos = async () => {
    if (photoUploads.some((photo) => !photo.file)) {
      alert('Пожалуйста, сделайте все необходимые фото перед загрузкой.')
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
            body: formData,
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Не удалось загрузить фото')
          }

          updatedUploads[i] = { ...photo, uploaded: true, url: data.photoUrl }
        }
      }

      setPhotoUploads(updatedUploads)
      alert('Фотографии успешно загружены.')
      setTimeout(() => {
        setCurrentStep(2)
        saveStepToStorage(2)
      }, 1000)
    } catch (error) {
      console.error('Error uploading photos:', error)
      alert('Не удалось загрузить фотографии. Попробуйте ещё раз.')
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
      setPhotoUploads((prev) =>
        prev.map((photo) =>
          photo.id === currentPhotoId ? { ...photo, file, uploaded: false } : photo
        )
      )
    }
    setCameraOpen(false)
    setCurrentPhotoId(null)
  }

  const updateFunctionalityTest = (testId: string, working: boolean) => {
    setFunctionalityTests((prev) =>
      prev.map((test) => (test.id === testId ? { ...test, working } : test))
    )
  }

  const calculateFinalPrice = () => {
    if (!request) return

    let totalPenaltyPercent = 0

    functionalityTests.forEach((test) => {
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

    if (functionalityTests.every((test) => test.working !== null) && currentStep === 2) {
      setTimeout(() => {
        setCurrentStep(3)
        saveStepToStorage(3)
      }, 500)
    }
  }

  const saveInspection = async () => {
    if (!request) return

    try {
      setSaving(true)

      let calculatedFinalPrice = finalPrice
      let calculatedTotalPenalty = totalPenalty

      if (calculatedFinalPrice === null) {
        let totalPenaltyPercent = 0

        functionalityTests.forEach((test) => {
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
          functionalityTests: functionalityTests.map((test) => ({
            id: test.id,
            working: test.working,
            penaltyPercent: test.penaltyPercent,
            isNegative: test.isNegative,
          })),
          finalPrice: calculatedFinalPrice,
          totalPenalty: calculatedTotalPenalty,
          photoUrls: photoUploads.filter((p) => p.uploaded).map((p) => p.url),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось сохранить проверку')
      }

      alert('Проверка успешно сохранена!')
      await updateRequestStatus('inspected')
      if (request) {
        setRequest({ ...request, status: 'inspected' })
      }
    } catch (error) {
      console.error('Error saving inspection:', error)
      alert('Не удалось сохранить проверку. Попробуйте ещё раз.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    calculateFinalPrice()
  }, [functionalityTests, request])

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
        return photoUploads.every((photo) => photo.uploaded)
      case 2: // Проверка
        return functionalityTests.every((test) => test.working !== null)
      case 3: // Оценка
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
          masterTelegramId: telegramId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось обновить статус')
      }

      const statusMessages = {
        inspected: 'Оценка подтверждена',
        paid: 'Оплачено и готово к завершению',
        completed: 'Заявка завершена',
      }

      alert(
        'Статус обновлён: ' +
        (statusMessages[status as keyof typeof statusMessages] || 'обновлено')
      )

      if (request) {
        setRequest({ ...request, status })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Не удалось обновить статус.')
    }
  }

  // Placeholder for handleBackFromAssessment
  const handleBackFromAssessment = () => {
    router.push('/master/points')
  }

  if (loading || !request) {
    return (
      <Page back={handleBackFromAssessment}>
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-slate-500">Загрузка...</p>
        </div>
      </Page>
    )
  }

  const progressPercent = ((currentStep - 1) / (MASTER_STEPS.length - 1)) * 100

  return (
    <Page back={handleBackFromAssessment}>
      {isCameraOpen ? (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
          <CameraWithOverlay
            onPhotoCapture={handlePhotoCapture}
            frameVariant={currentPhotoId === 'side' ? 'side' : currentPhotoId === 'back' ? 'back' : 'front'}
          />
        </div>
      ) : (
        <div className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-5xl px-2 pb-10 pt-10 lg:pt-16">
            <div className="mb-2 text-center">
              <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Вторичная оценка</h1>
              {/* <p className="mt-1 text-sm text-slate-500">Заявка #{request.id}</p> */}
              <div className="mt-2 flex justify-center">
                <Badge
                  variant="outline"
                  className={
                    request.status === 'completed'
                      ? 'border-emerald-200 bg-emerald-500 text-white px-4 text-sm font-semibold'
                      : request.status === 'paid'
                        ? 'border-sky-200 bg-sky-500 text-white px-4 text-sm font-semibold'
                        : request.status === 'inspected'
                          ? 'border-amber-200 bg-amber-500 text-white px-4 text-sm font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 px-4 text-sm font-semibold'
                  }
                >
                  {request.status === 'inspected' && 'Оценка подтверждена'}
                  {request.status === 'paid' && 'Оплачено'}
                  {request.status === 'completed' && 'Завершено'}
                  {!['inspected', 'paid', 'completed'].includes(request.status) && 'В работе'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {/* <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-sm backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900 text-center">
                    Информация о заявке
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-slate-500">Модель</p>
                      <p className="font-medium text-slate-900 break-words">{request.modelname || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Клиент</p>
                      <p className="font-medium text-slate-900">@{request.username}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Первоначальная цена</p>
                      <p className="font-medium text-slate-900">{request.price.toLocaleString()} RUB</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Создана</p>
                      <p className="font-medium text-slate-900">
                        {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    {request.sn && (
                      <div className="sm:col-span-2">
                        <p className="text-slate-500">Серийный номер</p>
                        <p className="font-medium text-slate-900 break-words">{request.sn}</p>
                      </div>
                    )}
                    {request.pickupPoint && (
                      <div className="sm:col-span-2">
                        <p className="text-slate-500">Пункт приёма</p>
                        <p className="font-medium text-slate-900 break-words">{request.pickupPoint}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card> */}

              <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-sm backdrop-blur-sm">
                <CardContent className="space-y-2 p-5">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {MASTER_STEPS.map((step) => {
                      const isActive = currentStep === step.id
                      const isPassed = currentStep > step.id
                      const baseClass = 'flex w-full flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition'
                      const stateClass = isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : isPassed
                          ? 'border-slate-200 bg-slate-100 text-slate-700'
                          : 'border-transparent bg-transparent text-slate-500'
                      const hoverClass = step.id > currentStep ? 'cursor-not-allowed opacity-50' : 'hover:border-slate-200 hover:bg-slate-100'
                      const badgeClass = isActive
                        ? 'border-white bg-white/20 text-white'
                        : 'border-slate-300 text-slate-600'

                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => {
                            if (step.id <= currentStep) {
                              setCurrentStep(step.id)
                              saveStepToStorage(step.id)
                            }
                          }}
                          disabled={step.id > currentStep}
                          className={`${baseClass} ${stateClass} ${hoverClass}`}
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${badgeClass}`}
                            >
                              {step.id}
                            </span>
                            {step.title}
                          </span>
                          <span className="text-xs text-slate-500">{step.subtitle}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="h-1 rounded-full bg-slate-200">
                    <div
                      className="h-1 rounded-full bg-slate-900 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {currentStep === 1 && (
                <Card className="rounded-3xl border border-white/60 bg-white shadow-sm backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <Camera className="h-5 w-5 text-slate-500" />
                      Шаг 1 — Фотографии
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      {photoUploads.map((photo, index) => {
                        const previewUrl = photo.file ? URL.createObjectURL(photo.file) : photo.url
                        const statusLabel = photo.uploaded
                          ? 'Загружено'
                          : photo.file
                            ? 'Ожидает загрузки'
                            : 'Нет фото'
                        const statusClass = photo.uploaded
                          ? 'text-emerald-600'
                          : photo.file
                            ? 'text-amber-600'
                            : 'text-slate-500'

                        return (
                          <div
                            key={photo.id}
                            className="rounded-2xl border border-white/70 bg-white p-4 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                                  {index + 1}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900">{photo.label}</p>
                                  <p className={`mt-1 text-xs font-medium ${statusClass}`}>
                                    {statusLabel}
                                  </p>
                                </div>
                              </div>
                              {photo.uploaded && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                            </div>
                            <div className="mt-4 overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-100">
                              {previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt={photo.label}
                                  className="aspect-square w-full object-cover"
                                />
                              ) : (
                                <div className="flex aspect-square w-full items-center justify-center text-slate-400">
                                  <Camera className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div className="mt-4 grid gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => openCamera(photo.id)}
                                className="w-full justify-center rounded-xl border-slate-200 text-slate-900 hover:bg-slate-100"
                              >
                                {photo.file ? 'Переснять' : 'Открыть камеру'}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <Button
                      onClick={uploadPhotos}
                      disabled={uploading || photoUploads.some((photo) => !photo.file)}
                      className="h-12 w-full rounded-2xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 disabled:bg-slate-300"
                    >
                      {uploading ? 'Загрузка...' : 'Загрузить фотографии'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card className="rounded-3xl border border-white/60 bg-white shadow-sm backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <Smartphone className="h-5 w-5 text-slate-500" />
                      Шаг 2 — Проверка функций
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      Отметьте результат каждого теста. При необходимости можно вернуться к предыдущим шагам.
                    </div>
                    <div className="space-y-3">
                      {functionalityTests.map((test) => {
                        const IconComponent = test.icon
                        const clientValueRaw =
                          (request.deviceConditions && request.deviceConditions[test.id]) ??
                          (request.additionalConditions && request.additionalConditions[test.id])
                        const clientValue = clientValueRaw === undefined ? null : String(clientValueRaw)

                        const baseButton = 'w-full rounded-xl border px-3 py-2 text-sm font-semibold transition'
                        const positiveActive = test.working === true
                        const negativeActive = test.working === false
                        const positiveClass = positiveActive
                          ? 'border-transparent bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                        const negativeClass = negativeActive
                          ? 'border-transparent bg-rose-600 text-white hover:bg-rose-700'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'

                        return (
                          <div
                            key={test.id}
                            className="grid items-start gap-4 rounded-2xl border border-white/70 bg-white p-4 shadow-sm sm:grid-cols-[56px_1fr_auto]"
                          >
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">
                              <IconComponent className="h-7 w-7 text-slate-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">{test.name}</p>
                              <p className="text-sm text-slate-500">{test.description}</p>
                              {clientValue !== null && (
                                <p className="mt-1 text-xs text-slate-500">
                                  Клиент: <span className="font-medium text-slate-900">{clientValue}</span>
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 sm:w-44">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => updateFunctionalityTest(test.id, true)}
                                className={`${baseButton} justify-center ${positiveClass}`}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                {test.isNegative ? 'Нет' : 'Работает'}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => updateFunctionalityTest(test.id, false)}
                                className={`${baseButton} justify-center ${negativeClass}`}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                {test.isNegative ? 'Есть' : 'Не работает'}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card className="rounded-3xl border border-white/60 bg-white shadow-sm backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-900">Шаг 3 — Оценка</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Первоначальная цена</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {request.price.toLocaleString()} RUB
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Сумма удержаний</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">
                          {totalPenalty ? totalPenalty.toLocaleString() : '0'} RUB
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                      <p className="text-sm text-emerald-600">Предложение клиенту</p>
                      <p className="mt-2 text-3xl font-bold text-emerald-700">
                        {(finalPrice !== null ? finalPrice : request.price).toLocaleString()} RUB
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        const confirmed = confirm('Зафиксировать расчёт с текущими результатами тестов?')
                        if (confirmed) {
                          calculateFinalPrice()
                          alert('Оценка зафиксирована. Итог — на следующем шаге.')
                          setTimeout(() => {
                            setCurrentStep(4)
                            saveStepToStorage(4)
                            if (finalPrice === null) {
                              calculateFinalPrice()
                            }
                          }, 600)
                        }
                      }}
                      className="h-12 w-full rounded-2xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800"
                    >
                      Зафиксировать оценку
                    </Button>
                  </CardContent>
                </Card>
              )}

              {currentStep === 4 && (
                <Card className="rounded-3xl border border-white/60 bg-white shadow-sm backdrop-blur-sm">
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Шаг 4 — Завершение</h3>
                        <p className="text-sm text-slate-600">
                          Завершите проверку или передайте заявку следующему ответственному.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {request.status === 'inspected' && (
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                            <p className="text-sm text-emerald-600">Предложение готово к оплате</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-700">
                              {(() => {
                                if (finalPrice === null) {
                                  let totalPenaltyPercent = 0
                                  functionalityTests.forEach((test) => {
                                    if (test.working !== null) {
                                      const shouldApplyPenalty = test.isNegative
                                        ? !test.working
                                        : test.working === false
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
                              })()}{' '}
                              RUB
                            </p>
                          </div>
                          <Button
                            onClick={() => updateRequestStatus('paid')}
                            className="h-12 w-full rounded-2xl bg-sky-600 text-white shadow-sm transition hover:bg-sky-700"
                          >
                            Отметить как оплачено
                          </Button>
                        </div>
                      )}

                      {request.status === 'paid' && (
                        <Button
                          onClick={async () => {
                            await updateRequestStatus('completed')
                            router.push('/master/points')
                          }}
                          className="h-12 w-full rounded-2xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          Завершить заявку
                        </Button>
                      )}

                      {request.status === 'completed' && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-700">
                          Заявка завершена
                        </div>
                      )}

                      {request.status === 'in_progress' && (
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                            <p className="text-sm text-slate-600">Черновик предложения</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">
                              {(() => {
                                if (finalPrice === null) {
                                  let totalPenaltyPercent = 0
                                  functionalityTests.forEach((test) => {
                                    if (test.working !== null) {
                                      const shouldApplyPenalty = test.isNegative
                                        ? !test.working
                                        : test.working === false
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
                              })()}{' '}
                              RUB
                            </p>
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
                                    masterTelegramId: telegramId,
                                  }),
                                })

                                const data = await response.json()

                                if (!response.ok) {
                                  throw new Error(data.error || 'Не удалось обновить статус')
                                }

                                setRequest((prev) => (prev ? { ...prev, status: 'inspected' } : prev))
                                alert('Проверка сохранена. Заявка готова к оплате.')
                              } catch (statusError) {
                                console.error('Error completing inspection:', statusError)
                              }
                            }}
                            className="h-12 w-full rounded-2xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800"
                          >
                            Отправить на оплату
                          </Button>
                        </div>
                      )}

                      {request.status !== 'in_progress' &&
                        request.status !== 'inspected' &&
                        request.status !== 'paid' &&
                        request.status !== 'completed' && (
                          <Button
                            onClick={saveInspection}
                            disabled={saving}
                            className="h-12 w-full rounded-2xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 disabled:bg-slate-400"
                          >
                            {saving ? 'Сохраняем...' : 'Сохранить проверку'}
                          </Button>
                        )}
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