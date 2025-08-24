'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Page } from '@/components/Page'

export default function TelegramIdPage() {
  const [username, setUsername] = useState('')
  const [telegramId, setTelegramId] = useState('')
  const [loading, setLoading] = useState(false)

  const findTelegramId = async () => {
    if (!username) {
      alert('Введите username')
      return
    }

    setLoading(true)
    try {
      // Простой способ - ищем в базе данных
      const response = await fetch(`/api/admin/find-telegram-id?username=${username}`)
      if (response.ok) {
        const data = await response.json()
        setTelegramId(data.telegramId || 'Не найден в базе')
      } else {
        setTelegramId('Не найден')
      }
    } catch (error) {
      setTelegramId('Ошибка поиска')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page back={true}>
      <div className="min-h-screen bg-gray-900">
        <div className="flex flex-col h-screen">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Найти Telegram ID</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="text-gray-300">Username (без @)</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      className="text-white bg-gray-700 border-gray-600 placeholder-gray-400"
                    />
                  </div>
                  
                  <Button 
                    onClick={findTelegramId} 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  >
                    {loading ? 'Поиск...' : 'Найти Telegram ID'}
                  </Button>

                  {telegramId && (
                    <div className="mt-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
                      <Label className="text-sm font-medium text-gray-300">Telegram ID:</Label>
                      <div className="text-white font-mono text-lg">{telegramId}</div>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-yellow-900 border border-yellow-700 rounded-lg">
                    <h3 className="font-medium text-yellow-200 mb-2">Как найти свой Telegram ID:</h3>
                    <ol className="text-sm text-yellow-100 space-y-1">
                      <li>1. Напишите боту @userinfobot в Telegram</li>
                      <li>2. Отправьте любое сообщение</li>
                      <li>3. Бот покажет ваш ID</li>
                      <li>4. Или используйте @RawDataBot</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
