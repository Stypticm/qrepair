'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchMasterDashboard, transferMasterRequest } from '@/lib/api'
import { useAppStore } from '@/stores/authStore'

interface Request {
  id: string
  modelname: string
  price: number
  username: string
  status: string
  createdAt: string
  sn?: string
  pickupPoint?: string
  assignedMaster?: {
    id: string
    name: string
  }
}

export default function MasterPointsPage() {
  const { telegramId } = useAppStore()
  const queryClient = useQueryClient()

  const [mutatingRequestId, setMutatingRequestId] = useState<string | null>(null)
  const [claimId, setClaimId] = useState('')
  const [claimError, setClaimError] = useState<string | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>()
  const isScannerOpenRef = useRef(false)
  const qrScannerRef = useRef<QrScanner | null>(null)

  const effectiveTelegramId = (typeof window !== 'undefined'
    ? (telegramId ||
        new URLSearchParams(window.location.search).get('telegramId') ||
        window.sessionStorage.getItem('telegramId'))
    : telegramId) as string | null

  useEffect(() => {
    if (typeof window !== 'undefined' && effectiveTelegramId) {
      window.sessionStorage.setItem('telegramId', effectiveTelegramId)
    }
  }, [effectiveTelegramId])

  useEffect(() => {
    isScannerOpenRef.current = isScannerOpen
  }, [isScannerOpen])

  const stopScanner = useCallback(() => {
    if (qrScannerRef.current) {
      try { qrScannerRef.current.stop(); } catch {}
      try { qrScannerRef.current.destroy(); } catch {}
      qrScannerRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = undefined
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      try {
        videoRef.current.pause()
      } catch (error) {
        console.error('Error pausing video', error)
      }
      videoRef.current.srcObject = null
    }

    isScannerOpenRef.current = false
    setIsScannerOpen(false)
  }, [])

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [stopScanner])

  const startScanner = useCallback(async () => {
    if (isScannerOpenRef.current) return
    if (typeof window === 'undefined') return

    const BarcodeDetector = (window as any).BarcodeDetector
    if (!BarcodeDetector) {
      // Фоллбек на библиотеку QrScanner (работает в WebView/старых браузерах)
      try {
        setScannerError(null)
        isScannerOpenRef.current = true
        setIsScannerOpen(true)
        const ensureVideoElement = async (): Promise<HTMLVideoElement> => {
          for (let attempt = 0; attempt < 10; attempt += 1) {
            if (videoRef.current) return videoRef.current
            await new Promise<void>((resolve) => { requestAnimationFrame(() => resolve()) })
          }
          throw new Error('Видеоэлемент не успел отрендериться.')
        }
        const videoElement = await ensureVideoElement()
        qrScannerRef.current = new QrScanner(
          videoElement,
          (result) => {
            try {
              const raw = typeof result === 'string' ? result : (result as any).data || String(result)
              const trimmed = raw?.trim()
              if (!trimmed) return
              let id: string | null = null
              try {
                const asJson = JSON.parse(trimmed)
                id = asJson?.skupkaId || asJson?.requestId || null
              } catch {}
              id = id || extractRequestId(trimmed)
              id = id || trimmed
              if (id) {
                setClaimId(id)
                setScannerError(null)
                if (isAlreadyAdded(id)) {
                  setClaimError('Заявка уже добавлена')
                  stopScanner()
                  return
                }
                claimRequestMutation.mutate({ requestId: id })
                stopScanner()
              }
            } catch {}
          },
          { preferredCamera: 'environment', returnDetailedScanResult: true, highlightScanRegion: true, highlightCodeOutline: true }
        )
        await qrScannerRef.current.start()
        return
      } catch (e) {
        console.error('QrScanner fallback failed:', e)
        setScannerError('Не удалось запустить сканер. Проверьте разрешения на камеру.')
        stopScanner()
        return
      }
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError('Не удалось получить доступ к камере устройства.')
      return
    }

    try {
      setScannerError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream
      isScannerOpenRef.current = true
      setIsScannerOpen(true)

      const ensureVideoElement = async (): Promise<HTMLVideoElement> => {
        for (let attempt = 0; attempt < 10; attempt += 1) {
          if (videoRef.current) {
            return videoRef.current
          }

          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve())
          })
        }

        throw new Error('Видеоэлемент не успел отрендериться.')
      }

      const videoElement = await ensureVideoElement()
      let detector: any = null
      if (BarcodeDetector) {
        try {
          detector = new BarcodeDetector({ formats: ['qr_code', 'qr', 'aztec', 'data_matrix', 'pdf417'] })
        } catch (e) {
          try {
            detector = new BarcodeDetector()
          } catch {}
        }
      }

      videoElement.srcObject = stream
      await videoElement.play()

      if (detector) {
        const scan = async () => {
          if (!videoRef.current || !isScannerOpenRef.current) return

          try {
            const barcodes = await detector.detect(videoElement)
            const code = barcodes?.[0]?.rawValue?.trim()

            if (code) {
              const id = extractRequestId(code) || code
              setClaimId(id)
              setScannerError(null)
              // Автодобавление заявки (с проверкой на дубликат)
              if (isAlreadyAdded(id)) {
                setClaimError('Заявка уже добавлена')
                stopScanner()
                return
              }
              claimRequestMutation.mutate({ requestId: id })
              stopScanner()
              return
            }
          } catch (error) {
            console.error('QR detection error:', error)
          }

          animationRef.current = requestAnimationFrame(scan)
        }

        animationRef.current = requestAnimationFrame(scan)
      } else {
        // Если detector не создался, фоллбек на QrScanner даже если API присутствует, но не работает
        try {
          qrScannerRef.current = new QrScanner(
            videoElement,
            (result) => {
              try {
                const raw = typeof result === 'string' ? result : (result as any).data || String(result)
                const trimmed = raw?.trim()
                if (!trimmed) return
                let id: string | null = null
                try {
                  const asJson = JSON.parse(trimmed)
                  id = asJson?.skupkaId || asJson?.requestId || null
                } catch {}
                id = id || extractRequestId(trimmed)
                id = id || trimmed
                if (id) {
                  setClaimId(id)
                  setScannerError(null)
                  claimRequestMutation.mutate({ requestId: id })
                  stopScanner()
                }
              } catch {}
            },
            { preferredCamera: 'environment', returnDetailedScanResult: true, highlightScanRegion: true, highlightCodeOutline: true }
          )
          await qrScannerRef.current.start()
        } catch (e) {
          console.error('QrScanner secondary fallback failed:', e)
          setScannerError('Не удалось запустить сканер. Попробуйте в другом браузере или в приложении Telegram.')
          stopScanner()
        }
      }
    } catch (error) {
      console.error('Error starting scanner:', error)
      setScannerError('Не удалось запустить камеру. Проверьте разрешения.')
      stopScanner()
    }
  }, [stopScanner])

  const claimRequestMutation = useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      const response = await fetch('/api/master/add-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          masterTelegramId: effectiveTelegramId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Не удалось добавить заявку.')
      }

      return data
    },
    onMutate: () => {
      setClaimError(null)
    },
    onSuccess: () => {
      setClaimId('')
      queryClient.invalidateQueries({ queryKey: ['masterDashboard', effectiveTelegramId] })
      alert('Заявка успешно добавлена.')
    },
    onError: (error: any) => {
      console.error('Error claiming request:', error)
      setClaimError(error?.message || 'Не удалось добавить заявку.')
    },
  })

  const extractRequestId = useCallback((input: string): string | null => {
    try {
      const str = input.trim()
      if (/^rq_[A-Za-z0-9_-]+$/.test(str)) return str
      if (/^[A-Za-z0-9_-]{6,}$/.test(str)) return str
      const url = new URL(str)
      const qp = url.searchParams
      const byRequestId = qp.get('requestId') || qp.get('id') || qp.get('rq')
      if (byRequestId) return byRequestId
      const segments = url.pathname.split('/').filter(Boolean)
      const idx = segments.findIndex(s => s.toLowerCase() === 'requests')
      if (idx >= 0 && segments[idx + 1]) return segments[idx + 1]
      return null
    } catch {
      return input.trim() || null
    }
  }, [])

  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['masterDashboard', effectiveTelegramId],
    queryFn: () => fetchMasterDashboard(effectiveTelegramId!),
    enabled: !!effectiveTelegramId,
  })

  const isAlreadyAdded = useCallback((id: string | null | undefined) => {
    if (!id) return false
    const list: any[] = (dashboardData as any)?.requests || []
    return list.some((r) => r?.id === id)
  }, [dashboardData])

  const handleClaim = useCallback(() => {
    if (!effectiveTelegramId) {
      setClaimError('Не найден Telegram ID.')
      return
    }

    const trimmed = claimId.trim()

    if (!trimmed) {
      setClaimError('Введите ID заявки.')
      return
    }

    setClaimError(null)
    const extracted = extractRequestId(trimmed)
    if (!extracted) {
      setClaimError('Не удалось распознать ID из QR. Введите вручную.')
      return
    }
    if (isAlreadyAdded(extracted)) {
      setClaimError('Заявка уже добавлена')
      return
    }
    claimRequestMutation.mutate({ requestId: extracted })
  }, [claimId, claimRequestMutation, effectiveTelegramId, extractRequestId, isAlreadyAdded])

  

  const transferRequestMutation = useMutation({
    mutationFn: transferMasterRequest,
    onMutate: (requestId: string) => {
      setMutatingRequestId(requestId)
    },
    onSettled: () => {
      setMutatingRequestId(null)
      queryClient.invalidateQueries({ queryKey: ['masterDashboard', effectiveTelegramId] })
    },
    onError: (mutationError: any) => {
      console.error('Error transferring request:', mutationError)
      alert(`Error: ${mutationError.message}`)
    },
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        stopScanner()
      }
    }

    if (isScannerOpen) {
      window.addEventListener('keydown', onKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isScannerOpen, stopScanner])

  if (!effectiveTelegramId) {
    return (
      <Page back={true}>
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center text-sm text-gray-600">
            Нет telegramId. Откройте приложение из Telegram или перезапустите.
          </div>
        </div>
      </Page>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ошибка: {(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <Page back={true}>
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto pt-16 px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Панель мастера</h1>
          </div>

          <div className="mb-10 rounded-xl border border-gray-200 bg-white/60 p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Добавить заявку по ID</h2>
            <p className="text-sm text-gray-600 mb-4">
              Введите идентификатор заявки или отсканируйте QR-код, который показывает клиент.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  value={claimId}
                  onChange={(event) => setClaimId(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleClaim()
                    }
                  }}
                  placeholder="Например, rq_12345"
                  inputMode="text"
                  autoComplete="off"
                  disabled={claimRequestMutation.isPending}
                />
              </div>
              <Button onClick={handleClaim} disabled={claimRequestMutation.isPending}>
                {claimRequestMutation.isPending ? 'Добавление...' : 'Добавить'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={startScanner}
                disabled={isScannerOpen}
              >
                Сканировать QR
              </Button>
            </div>
            {claimError && <p className="text-sm text-red-500 mt-2">{claimError}</p>}
            {scannerError && <p className="text-sm text-amber-600 mt-2">{scannerError}</p>}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Мои заявки</h2>
              <div className="w-full flex items-center justify-center py-6">
                <div className="inline-block h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
              </div>
            </div>
          ) : dashboardData?.requests?.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Мои заявки</h2>
              {dashboardData.requests.map((request: Request) => {
                const isTransferring =
                  transferRequestMutation.isPending && mutatingRequestId === request.id

                return (
                  <div key={request.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-md font-semibold text-gray-900">
                            {request.modelname || 'Не указано'}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              request.status === 'submitted'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {request.status === 'submitted' ? 'Новая' : request.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Клиент:</strong> @{request.username}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Цена:</strong>{' '}
                          {request.price ? `${request.price.toLocaleString()} ₽` : 'Не указана'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Дата:</strong>{' '}
                          {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <Button
                        variant="outline"
                        asChild
                        className="w-full text-green-600 px-4 py-2 rounded-md text-center hover:bg-green-800 transition-colors"
                      >
                        <Link href={`/master/requests/${request.id}`}>Просмотреть детали</Link>
                      </Button>
                      <Button
                        onClick={() => transferRequestMutation.mutate(request.id)}
                        disabled={transferRequestMutation.isPending}
                        variant="outline"
                        className="w-full text-slate-500 px-4 py-2 rounded-md text-center hover:bg-slate-700 transition-colors"
                      >
                        {isTransferring ? 'Передача...' : 'Передать заявку'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет назначенных заявок</h3>
              <p className="text-gray-500">Ожидайте назначения новых заявок от администратора</p>
            </div>
          )}
        </div>
      </div>

      {isScannerOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-black/20 p-4">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30">
              <video
                ref={videoRef}
                className="h-72 w-full object-cover"
                playsInline
                muted
                autoPlay
              />
              {/* Круглая маска/рамка для сканирования */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                  className="rounded-full"
                  style={{
                    width: '220px',
                    height: '220px',
                    boxShadow: '0 0 0 2000px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(255,255,255,0.85)',
                  }}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {scannerError && <p className="text-sm text-amber-400 text-center">{scannerError}</p>}
              <Button variant="outline" onClick={() => stopScanner()}>
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}
    </Page>
  )
}
