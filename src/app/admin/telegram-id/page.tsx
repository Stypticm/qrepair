'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Page } from '@/components/Page'

export default function TelegramIdPage() {

  return (
    <Page back={true}>
      <div className="min-h-screen bg-gray-900">
        <div className="flex flex-col h-screen">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Как получить Telegram ID</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mt-4 p-3 bg-blue-900 border border-blue-700 rounded-lg">
                    <h3 className="font-medium text-blue-200 mb-2">ℹ️ Инструкция для получения Telegram ID:</h3>
                    <div className="text-sm text-blue-100 space-y-1">
                      <p>• <strong>Напишите боту @userinfobot</strong> в Telegram</p>
                      <p>• <strong>Отправьте любое сообщение</strong> боту</p>
                      <p>• <strong>Бот покажет ваш ID</strong> - скопируйте его</p>
                      <p>• <strong>Передайте ID админу</strong> для добавления в систему</p>
                    </div>
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
