"use client"

import { useState, useEffect } from 'react'
import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ColorScreenTest } from '@/components/ui/color-screen-test'
import { DEVICE_TESTS, calculatePriceAdjustment } from '@/core/lib/deviceTests'
import { DeviceTest, TestResult } from '@/core/lib/interfaces'
import { useSearchParams } from 'next/navigation'

export default function DeviceInspectionPage() {
  const searchParams = useSearchParams()
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
      setError('Введите ID заявки и username мастера')
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
      setDeviceInfo(data.skupka)
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
      // Можно перенаправить на страницу результатов
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
  }, [testResults, isVerified])

  const currentTest = DEVICE_TESTS[currentTestIndex]
  const progress = (testResults.length / DEVICE_TESTS.length) * 100

  if (!isVerified) {
    return (
      <Page back={true}>
        <div className="flex flex-col items-center justify-start w-full h-full p-4">
          <h2 className="text-2xl font-extrabold uppercase text-black tracking-tight mb-6 text-center">
            🔍 Проверка устройства
          </h2>

          <div className="w-full max-w-md space-y-4">
            <div>
              <Label htmlFor="skupkaId">ID заявки</Label>
              <Input
                id="skupkaId"
                value={skupkaId || ''}
                placeholder="Введите ID заявки"
                disabled={true}
              />
            </div>

            <div>
              <Label htmlFor="masterUsername">Username мастера</Label>
              <Input
                id="masterUsername"
                value={masterUsername}
                onChange={(e) => setMasterUsername(e.target.value)}
                placeholder="Введите ваш username (без @)"
              />
            </div>

            <Button 
              onClick={generateOTP} 
              disabled={loading || !skupkaId || !masterUsername}
              className="w-full"
            >
              {loading ? 'Отправка...' : 'Получить OTP код'}
            </Button>

            <div className="border-t pt-4">
              <Label htmlFor="inspectionToken">OTP код</Label>
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
      <div className="flex flex-col items-center justify-start w-full h-full p-4">
        <h2 className="text-2xl font-extrabold uppercase text-black tracking-tight mb-4 text-center">
          🔍 Проверка устройства
        </h2>

        {deviceInfo && (
          <div className="w-full max-w-md mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Информация об устройстве</h3>
            <p><strong>Модель:</strong> {deviceInfo.modelname || 'Не указана'}</p>
            <p><strong>Базовая цена:</strong> {deviceInfo.price ? `${Math.round(deviceInfo.price)} ₽` : 'Не указана'}</p>
            <p><strong>Статус:</strong> {deviceInfo.status}</p>
          </div>
        )}

        <div className="w-full max-w-md mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Прогресс проверки</span>
            <span className="text-sm text-gray-600">
              {testResults.length} / {DEVICE_TESTS.length}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {currentTest && (
          <div className="w-full max-w-2xl">
            {currentTest.type === 'color' ? (
              <ColorScreenTest
                testId={currentTest.id}
                color={currentTest.id.replace('display_', '')}
                colorName={currentTest.name}
                onResult={updateTestResult}
                required={currentTest.required}
              />
            ) : (
              <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
                <h3 className="text-lg font-semibold text-center">
                  {currentTest.name}
                </h3>
                
                <p className="text-center text-gray-600 max-w-md">
                  {currentTest.description}
                </p>

                {currentTest.type === 'checkbox' && (
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${currentTest.id}-pass`}
                        checked={testResults.find(r => r.testId === currentTest.id)?.passed === true}
                        onCheckedChange={(checked) => updateTestResult(currentTest.id, checked === true)}
                      />
                      <Label htmlFor={`${currentTest.id}-pass`}>Работает</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${currentTest.id}-fail`}
                        checked={testResults.find(r => r.testId === currentTest.id)?.passed === false}
                        onCheckedChange={(checked) => updateTestResult(currentTest.id, checked === true ? false : true)}
                      />
                      <Label htmlFor={`${currentTest.id}-fail`}>Не работает</Label>
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
                        />
                        <Label htmlFor={`${currentTest.id}-${option}`}>{option}</Label>
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
              >
                Назад
              </Button>

              {currentTestIndex < DEVICE_TESTS.length - 1 ? (
                <Button
                  onClick={() => setCurrentTestIndex(currentTestIndex + 1)}
                  disabled={!testResults.find(r => r.testId === currentTest.id)}
                >
                  Следующий
                </Button>
              ) : (
                <Button
                  onClick={completeInspection}
                  disabled={loading || testResults.length < DEVICE_TESTS.length}
                >
                  {loading ? 'Завершение...' : 'Завершить проверку'}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="w-full max-w-md mt-6">
          <Label htmlFor="inspectionNotes">Заметки по проверке</Label>
          <textarea
            id="inspectionNotes"
            value={inspectionNotes}
            onChange={(e) => setInspectionNotes(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
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


