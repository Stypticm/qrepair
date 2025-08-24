"use client"

import { useState, useEffect } from 'react'
import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ColorScreenTest } from '@/components/ui/color-screen-test'
import { ColorSlider } from '@/components/ui/color-slider'
import { DEVICE_TESTS, calculatePriceAdjustment } from '@/core/lib/deviceTests'
import { DeviceTest, TestResult } from '@/core/lib/interfaces'
import { useSearchParams, useRouter } from 'next/navigation'

export default function DeviceInspectionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const skupkaId = searchParams.get('id')
  
  const [masterUsername, setMasterUsername] = useState('')
  const [inspectionToken, setInspectionToken] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [currentTestIndex, setCurrentTestIndex] = useState(0)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [inspectionNotes, setInspectionNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deviceInfo, setDeviceInfo] = useState<any>(null)

  // Генерация OTP токена
  const generateOTP = async () => {
    if (!skupkaId || !masterUsername) {
      setError('Введите ID заявки и Telegram username мастера')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/inspection/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skupkaId, masterUsername })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка генерации OTP')
      }

      setError('')
      alert('OTP код отправлен в Telegram!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Проверка OTP токена
  const verifyOTP = async () => {
    if (!skupkaId || !masterUsername || !inspectionToken) {
      setError('Заполните все поля')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/inspection/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skupkaId, masterUsername, inspectionToken })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка проверки OTP')
      }

      const data = await response.json()
      setDeviceInfo({
        ...data.skupka,
        inspectionId: data.inspection.id
      })
      setIsVerified(true)
      setError('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Обновление результатов теста
  const updateTestResult = (testId: string, passed: boolean, notes?: string) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.testId === testId)
      if (existing) {
        return prev.map(r => r.testId === testId ? { ...r, passed, notes, value: passed } : r)
      }
      return [...prev, { testId, passed, notes, value: passed }]
    })
  }

  // Сохранение промежуточных результатов
  const saveProgress = async () => {
    if (!isVerified) return

    try {
      await fetch('/api/inspection/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionId: deviceInfo?.inspectionId, testsResults: testResults })
      })
    } catch (err) {
      console.error('Error saving progress:', err)
    } 
  }

  // Завершение проверки
  const completeInspection = async () => {
    if (!isVerified) return

    setLoading(true)
    try {
      const response = await fetch('/api/inspection/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inspectionId: deviceInfo?.inspectionId, 
          inspectionNotes 
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка завершения проверки')
      }

      const data = await response.json()
      alert(`Проверка завершена! Окончательная цена: ${Math.round(data.finalPrice)} ₽`)
      // Показываем сообщение о редиректе
      setError('Перенаправление на страницу "Мои устройства"...')
      // Перенаправляем на страницу "Мои устройства" с небольшой задержкой
      setTimeout(() => {
        router.push('/my-devices')
      }, 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Автосохранение при изменении результатов
  useEffect(() => {
    if (isVerified && testResults.length > 0) {
      const timeout = setTimeout(saveProgress, 1000)
      return () => clearTimeout(timeout)
    }
  }, [testResults, isVerified, saveProgress])

  const currentTest = DEVICE_TESTS[currentTestIndex]
  const progress = (testResults.length / DEVICE_TESTS.length) * 100

  // Сброс результатов при изменении текущего теста
  useEffect(() => {
    if (isVerified && currentTest) {
      // При переходе между тестами сбрасываем локальное состояние
      // но сохраняем результаты в testResults
      // Это поможет избежать проблем с отображением предыдущих выборов
    }
  }, [currentTestIndex, isVerified, currentTest?.id, currentTest])

  // Сброс состояния чекбоксов при переходе между тестами
  const resetCheckboxState = () => {
    // Принудительно обновляем состояние чекбоксов
    // чтобы они отображали правильное состояние
  }

  // Сброс состояния чекбоксов при переходе между тестами
  useEffect(() => {
    if (isVerified && currentTest) {
      // Принудительно обновляем состояние чекбоксов
      // чтобы они отображали правильное состояние
      const currentTestResult = testResults.find(r => r.testId === currentTest.id)
      if (currentTestResult) {
        // Обновляем состояние, чтобы синхронизировать с результатами
        setTestResults(prev => prev.map(r => 
          r.testId === currentTest.id ? { ...r, value: r.passed } : r
        ))
      }
    }
  }, [currentTestIndex, isVerified, currentTest?.id, testResults, currentTest])

  if (!isVerified) {
    return (
      <Page back={true}>
        <div className="flex flex-col items-center justify-start w-full h-full p-4 bg-gray-900 min-h-screen">
          <h2 className="text-2xl font-extrabold uppercase text-white tracking-tight mb-6 text-center">
            🔍 Проверка устройства
          </h2>

          <div className="w-full max-w-md space-y-4">
            <div className="text-white">
              <Label htmlFor="skupkaId" className="text-white">ID заявки</Label>
              <Input
                id="skupkaId"
                value={skupkaId || ''}
                placeholder="Введите ID заявки"
                disabled={true}
                className="bg-gray-800 text-white border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="masterUsername" className="text-white">Telegram username</Label>
              <Input
                id="masterUsername"
                value={masterUsername}
                className="bg-gray-800 text-white border-gray-600"
                onChange={(e) => setMasterUsername(e.target.value)}
                placeholder="Введите ваш username (без @)"
              />
            </div>

            <Button 
              onClick={generateOTP} 
              disabled={loading || !skupkaId || !masterUsername}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Отправка...' : 'Получить OTP код'}
            </Button>

            <div className="border-t border-gray-600 pt-4">
              <Label htmlFor="inspectionToken" className="text-white">OTP код</Label>
              <Input
                id="inspectionToken"
                value={inspectionToken}
                onChange={(e) => setInspectionToken(e.target.value)}
                placeholder="Введите 6-значный код"
                maxLength={6}
              />
            </div>

            <Button 
              onClick={verifyOTP} 
              disabled={loading || !inspectionToken}
              className="w-full"
            >
              {loading ? 'Проверка...' : 'Начать проверку'}
            </Button>

            {error && (
              <div className="text-red-500 text-center text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page back={true}>
      <div className="flex flex-col items-center justify-start w-full h-full p-4 bg-gray-900 min-h-screen">
        <h2 className="text-2xl font-extrabold uppercase text-white tracking-tight mb-4 text-center">
          🔍 Проверка устройства
        </h2>

        {deviceInfo && (
          <div className="w-full max-w-md mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <h3 className="font-semibold mb-2 text-white">Информация об устройстве</h3>
            <p className="text-white"><strong>Модель:</strong> {deviceInfo.modelname || 'Не указана'}</p>
            <p className="text-white"><strong>Базовая цена:</strong> {deviceInfo.price ? `${Math.round(deviceInfo.price)} ₽` : 'Не указана'}</p>
            <p className="text-white"><strong>Статус:</strong> {deviceInfo.status}</p>
          </div>
        )}

        <div className="w-full max-w-md mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-white">Прогресс проверки</span>
            <span className="text-sm text-gray-300">
              {testResults.length} / {DEVICE_TESTS.length}
            </span>
          </div>
          <Progress value={progress} className="w-full bg-gray-200" />
        </div>

        {currentTest && (
          <div className="w-full max-w-2xl">
            {currentTest.type === 'color' ? (
              <ColorSlider
                onResult={updateTestResult}
                onComplete={() => {
                  // После завершения цветовых тестов переходим к следующему тесту
                  // Ищем первый тест после цветовых (начиная с индекса 5, так как цветовые тесты идут с 4 по 8)
                  const nextTestIndex = 9 // Индекс первого теста после цветовых
                  if (nextTestIndex < DEVICE_TESTS.length) {
                    setCurrentTestIndex(nextTestIndex)
                  } else {
                    // Если нет следующих тестов, завершаем проверку
                    setCurrentTestIndex(DEVICE_TESTS.length - 1)
                  }
                }}
              />
            ) : (
              <div key={currentTest.id} className="flex flex-col items-center gap-4 p-4 border border-gray-600 rounded-lg bg-gray-800">
                <h3 className="text-lg font-semibold text-center text-white">
                  {currentTest.name}
                </h3>
                
                <p className="text-center text-gray-300 max-w-md">
                  {currentTest.description}
                </p>

                {currentTest.type === 'checkbox' && (
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${currentTest.id}-pass`}
                        checked={testResults.find(r => r.testId === currentTest.id)?.passed === true}
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            updateTestResult(currentTest.id, true)
                          }
                        }}
                      />
                      <Label htmlFor={`${currentTest.id}-pass`} className="text-white">Работает</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${currentTest.id}-fail`}
                        checked={testResults.find(r => r.testId === currentTest.id)?.passed === false}
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            updateTestResult(currentTest.id, false)
                          }
                        }}
                      />
                      <Label htmlFor={`${currentTest.id}-fail`} className="text-white">Не работает</Label>
                    </div>
                  </div>
                )}

                {currentTest.type === 'radio' && currentTest.options && (
                  <div className="flex flex-col gap-2">
                    {currentTest.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`${currentTest.id}-${option}`}
                          name={currentTest.id}
                          value={option}
                          onChange={(e) => updateTestResult(currentTest.id, true, e.target.value)}
                          className="text-white"
                        />
                        <Label htmlFor={`${currentTest.id}-${option}`} className="text-white">{option}</Label>
                      </div>
                    ))}
                  </div>
                )}

                {currentTest.required && (
                  <p className="text-xs text-red-500 text-center">
                    * Обязательный тест
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button
                onClick={() => setCurrentTestIndex(Math.max(0, currentTestIndex - 1))}
                disabled={currentTestIndex === 0}
                variant="outline"
                className="border-gray-600 text-black hover:bg-gray-700"
              >
                Назад
              </Button>

              {currentTestIndex < DEVICE_TESTS.length - 1 ? (
                <Button
                  onClick={() => setCurrentTestIndex(currentTestIndex + 1)}
                  disabled={!testResults.find(r => r.testId === currentTest.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Следующий
                </Button>
              ) : (
                <Button
                  onClick={completeInspection}
                  disabled={loading || testResults.length < DEVICE_TESTS.length}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Завершение...' : 'Завершить проверку'}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="w-full max-w-md mt-6">
          <Label htmlFor="inspectionNotes" className="text-white">Заметки по проверке</Label>
          <textarea
            id="inspectionNotes"
            value={inspectionNotes}
            onChange={(e) => setInspectionNotes(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-600 rounded bg-gray-800 text-white"
            placeholder="Дополнительные заметки..."
            rows={3}
          />
        </div>

        {error && (
          <div className="text-red-500 text-center text-sm mt-4">
            {error}
          </div>
        )}
      </div>
    </Page>
  )
}


