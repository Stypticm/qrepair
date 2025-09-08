'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react'

interface VoiceCommand {
  id: string
  command: string
  action: string
  response?: string
  timestamp: Date
}

export default function VoiceAgentWidget() {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [lastCommand, setLastCommand] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Проверяем поддержку браузера
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = false
        recognition.lang = 'ru-RU'
        setRecognition(recognition)
      }
    }
  }, [])

  const startListening = () => {
    if (!recognition) return

    recognition.onstart = () => {
      setIsListening(true)
      console.log('🎤 Начато прослушивание...')
    }

    recognition.onresult = async (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim()
      console.log('🎤 Распознано:', transcript)
      setLastCommand(transcript)
      setIsProcessing(true)
      
      await processVoiceCommand(transcript)
      setIsProcessing(false)
    }

    recognition.onerror = (event: any) => {
      console.error('Ошибка распознавания речи:', event.error)
      setIsListening(false)
      setIsProcessing(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      console.log('🎤 Прослушивание остановлено')
    }

    recognition.start()
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }

  const processVoiceCommand = async (command: string) => {
    try {
      // Сохраняем команду
      await fetch('/api/agents/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      })

      // Обрабатываем команду
      if (command.includes('показать статистику')) {
        await speak('Загружаю статистику...')
        // Здесь можно добавить логику показа статистики
      } else if (command.includes('запустить тесты')) {
        await speak('Запускаю тесты...')
        const response = await fetch('/api/agents/testing/run', { method: 'POST' })
        if (response.ok) {
          await speak('Тесты запущены успешно')
        } else {
          await speak('Ошибка запуска тестов')
        }
      } else if (command.includes('показать рекомендации')) {
        await speak('Загружаю рекомендации...')
        // Здесь можно добавить логику показа рекомендаций
      } else if (command.includes('обновить данные')) {
        await speak('Обновляю данные...')
        window.location.reload()
      } else if (command.includes('помощь')) {
        await speak('Доступные команды: показать статистику, запустить тесты, показать рекомендации, обновить данные')
      } else {
        await speak('Команда не распознана. Скажите помощь для списка команд')
      }
    } catch (error) {
      console.error('Ошибка обработки команды:', error)
      await speak('Произошла ошибка при выполнении команды')
    }
  }

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ru-RU'
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎤 Голосовой Агент
            <Badge variant="outline" className="bg-red-100 text-red-800">
              Не поддерживается
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Ваш браузер не поддерживает распознавание речи
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎤 Голосовой Агент
          <Badge variant="outline" className={isListening ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {isListening ? 'Слушает' : 'Остановлен'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span className="text-sm">
                {lastCommand ? `Последняя команда: &quot;${lastCommand}&quot;` : 'Готов к работе'}
              </span>
            </div>
            <Button 
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              size="sm"
              className={isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isListening ? (
                <MicOff className="w-4 h-4 mr-2" />
              ) : (
                <Mic className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? 'Обработка...' : isListening ? 'Остановить' : 'Начать слушать'}
            </Button>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Доступные команды:</p>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <span>• &quot;показать статистику&quot;</span>
              <span>• &quot;запустить тесты&quot;</span>
              <span>• &quot;показать рекомендации&quot;</span>
              <span>• &quot;обновить данные&quot;</span>
              <span>• &quot;помощь&quot;</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
