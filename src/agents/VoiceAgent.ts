import prisma from '@/core/lib/prisma'

export interface VoiceCommand {
  id: string
  command: string
  action: string
  parameters?: any
  response?: string
  timestamp: Date
}

export interface VoiceResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

export class VoiceAgent {
  private isListening = false
  private recognition: any = null
  private commands: Map<
    string,
    (params?: any) => Promise<VoiceResponse>
  > = new Map()

  constructor() {
    this.initializeCommands()
  }

  // Инициализация голосовых команд
  private initializeCommands() {
    this.commands.set(
      'показать статистику',
      this.showStats.bind(this)
    )
    this.commands.set(
      'запустить тесты',
      this.runTests.bind(this)
    )
    this.commands.set(
      'показать рекомендации',
      this.showRecommendations.bind(this)
    )
    this.commands.set(
      'обновить данные',
      this.refreshData.bind(this)
    )
    this.commands.set(
      'показать ошибки',
      this.showErrors.bind(this)
    )
    this.commands.set(
      'показать пользователей',
      this.showUsers.bind(this)
    )
    this.commands.set('помощь', this.showHelp.bind(this))
  }

  // Запуск голосового агента
  async startListening(): Promise<boolean> {
    if (typeof window === 'undefined') {
      console.log(
        'Голосовой агент работает только в браузере'
      )
      return false
    }

    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    ) {
      console.log(
        'Браузер не поддерживает распознавание речи'
      )
      return false
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      this.recognition = new SpeechRecognition()

      this.recognition.continuous = true
      this.recognition.interimResults = false
      this.recognition.lang = 'ru-RU'

      this.recognition.onstart = () => {
        this.isListening = true
        console.log(
          '🎤 Голосовой агент начал прослушивание...'
        )
      }

      this.recognition.onresult = async (event: any) => {
        const transcript = event.results[
          event.results.length - 1
        ][0].transcript
          .toLowerCase()
          .trim()
        console.log('🎤 Распознано:', transcript)

        await this.processVoiceCommand(transcript)
      }

      this.recognition.onerror = (event: any) => {
        console.error(
          'Ошибка распознавания речи:',
          event.error
        )
        this.isListening = false
      }

      this.recognition.onend = () => {
        this.isListening = false
        console.log('🎤 Голосовой агент остановлен')
      }

      this.recognition.start()
      return true
    } catch (error) {
      console.error(
        'Ошибка инициализации голосового агента:',
        error
      )
      return false
    }
  }

  // Остановка голосового агента
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  // Обработка голосовой команды
  private async processVoiceCommand(
    transcript: string
  ): Promise<void> {
    // Сохраняем команду в БД
    await this.saveVoiceCommand(transcript)

    // Поиск подходящей команды
    for (const [command, handler] of this.commands) {
      if (transcript.includes(command)) {
        try {
          const response = await handler()
          await this.speak(response.message)
          return
        } catch (error) {
          console.error('Ошибка выполнения команды:', error)
          await this.speak(
            'Произошла ошибка при выполнении команды'
          )
        }
      }
    }

    // Если команда не найдена
    await this.speak(
      'Команда не распознана. Скажите "помощь" для списка команд'
    )
  }

  // Синтез речи
  private async speak(text: string): Promise<void> {
    if (typeof window === 'undefined') return

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ru-RU'
      utterance.rate = 0.9
      utterance.pitch = 1

      window.speechSynthesis.speak(utterance)
    }
  }

  // Сохранение голосовой команды
  private async saveVoiceCommand(
    command: string
  ): Promise<void> {
    try {
      await prisma.agentAnalytics.create({
        data: {
          agentType: 'voice_agent',
          metric: 'voice_command',
          value: 1,
          metadata: {
            command,
            timestamp: new Date(),
          },
        },
      })
    } catch (error) {
      console.error(
        'Ошибка сохранения голосовой команды:',
        error
      )
    }
  }

  // Голосовые команды
  private async showStats(): Promise<VoiceResponse> {
    try {
      const testStats =
        await prisma.agentTestResult.aggregate({
          _count: { id: true },
          _avg: { duration: true },
          where: { status: 'passed' },
        })

      const uxStats = await prisma.agentAnalytics.count({
        where: {
          agentType: 'ux_analytics',
          metric: 'session_duration',
        },
      })

      const message = `Статистика: ${testStats._count.id} успешных тестов, ${uxStats} пользовательских сессий`
      return {
        success: true,
        message,
        data: { testStats, uxStats },
      }
    } catch (error) {
      return {
        success: false,
        message: 'Ошибка получения статистики',
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      }
    }
  }

  private async runTests(): Promise<VoiceResponse> {
    try {
      const response = await fetch(
        '/api/agents/testing/run',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      )

      if (response.ok) {
        return {
          success: true,
          message: 'Тесты запущены успешно',
        }
      } else {
        return {
          success: false,
          message: 'Ошибка запуска тестов',
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Ошибка запуска тестов',
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      }
    }
  }

  private async showRecommendations(): Promise<VoiceResponse> {
    try {
      const recommendations =
        await prisma.agentRecommendation.findMany({
          where: { status: 'pending' },
          orderBy: { createdAt: 'desc' },
          take: 5,
        })

      if (recommendations.length === 0) {
        return {
          success: true,
          message: 'Нет новых рекомендаций',
        }
      }

      const message = `Найдено ${recommendations.length} рекомендаций. Первая: ${recommendations[0].title}`
      return {
        success: true,
        message,
        data: recommendations,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Ошибка получения рекомендаций',
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      }
    }
  }

  private async refreshData(): Promise<VoiceResponse> {
    try {
      // Обновляем данные
      const response = await fetch('/api/agents/ux/stats')
      if (response.ok) {
        return {
          success: true,
          message: 'Данные обновлены',
        }
      } else {
        return {
          success: false,
          message: 'Ошибка обновления данных',
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Ошибка обновления данных',
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      }
    }
  }

  private async showErrors(): Promise<VoiceResponse> {
    try {
      const errors = await prisma.agentTestResult.findMany({
        where: { status: 'failed' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })

      if (errors.length === 0) {
        return {
          success: true,
          message: 'Ошибок не найдено',
        }
      }

      const message = `Найдено ${errors.length} ошибок. Последняя: ${errors[0].testName}`
      return { success: true, message, data: errors }
    } catch (error) {
      return {
        success: false,
        message: 'Ошибка получения ошибок',
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      }
    }
  }

  private async showUsers(): Promise<VoiceResponse> {
    try {
      const sessions = await prisma.agentAnalytics.count({
        where: {
          agentType: 'ux_analytics',
          metric: 'session_duration',
        },
      })

      const message = `Активных пользователей: ${sessions}`
      return { success: true, message, data: { sessions } }
    } catch (error) {
      return {
        success: false,
        message: 'Ошибка получения данных пользователей',
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      }
    }
  }

  private async showHelp(): Promise<VoiceResponse> {
    const commands = [
      'показать статистику',
      'запустить тесты',
      'показать рекомендации',
      'обновить данные',
      'показать ошибки',
      'показать пользователей',
    ]

    const message = `Доступные команды: ${commands.join(
      ', '
    )}`
    return { success: true, message, data: { commands } }
  }

  // Получение статуса
  isAgentListening(): boolean {
    return this.isListening
  }

  // Получение истории команд
  async getCommandHistory(): Promise<VoiceCommand[]> {
    try {
      const commands = await prisma.agentAnalytics.findMany(
        {
          where: {
            agentType: 'voice_agent',
            metric: 'voice_command',
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }
      )

      return commands.map((cmd) => ({
        id: cmd.id,
        command:
          cmd.metadata &&
          typeof cmd.metadata === 'object' &&
          'command' in cmd.metadata
            ? (cmd.metadata as any).command || ''
            : '',
        action: 'voice_command',
        response: 'processed',
        timestamp: cmd.createdAt,
      }))
    } catch (error) {
      console.error(
        'Ошибка получения истории команд:',
        error
      )
      return []
    }
  }
}
