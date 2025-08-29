'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Page } from '@/components/Page'

export default function TelegramIdPage() {

  return (
    <Page back={true}>
      <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">🔍 Telegram ID</h1>
              <p className="text-gray-600">Инструкция по получению идентификатора</p>
            </div>
            
            <Card className="bg-white border border-gray-200 rounded-2xl shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-gray-900">Как получить Telegram ID</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h3 className="font-semibold text-blue-900 mb-3">ℹ️ Инструкция для получения Telegram ID:</h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">1.</span>
                      <p><strong>Напишите боту @userinfobot</strong> в Telegram</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">2.</span>
                      <p><strong>Отправьте любое сообщение</strong> боту</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">3.</span>
                      <p><strong>Бот покажет ваш ID</strong> - скопируйте его</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">4.</span>
                      <p><strong>Передайте ID админу</strong> для добавления в систему</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Page>
  )
}
