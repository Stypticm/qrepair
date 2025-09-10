'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestTelegramPage() {
  const [telegramId, setTelegramId] = useState('296925626')
  const [message, setMessage] = useState('Тестовое сообщение от QRepair')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testBotConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-bot')
      const data = await response.json()
      setResult({ type: 'config', data })
    } catch (error) {
      setResult({ type: 'config', error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testSendMessage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-telegram-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId,
          message,
        }),
      })
      const data = await response.json()
      setResult({ type: 'send', data })
    } catch (error) {
      setResult({ type: 'send', error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Тестирование Telegram Bot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button 
                onClick={testBotConfig} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Проверяем...' : 'Проверить конфигурацию бота'}
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Telegram ID:</label>
              <Input
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                placeholder="Введите Telegram ID"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Сообщение:</label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Введите сообщение"
              />
            </div>
            
            <div>
              <Button 
                onClick={testSendMessage} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Отправляем...' : 'Отправить тестовое сообщение'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>
                {result.type === 'config' ? '🔧 Конфигурация бота' : '📤 Результат отправки'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
