import prisma from '@/core/lib/prisma'

export interface UserSession {
  sessionId: string
  startTime: Date
  endTime?: Date
  pages: string[]
  actions: UserAction[]
  dropOffPage?: string
  completed: boolean
}

export interface UserAction {
  action: string
  page: string
  timestamp: Date
  data?: any
  duration?: number
}

export interface UXMetrics {
  pageViews: Map<string, number>
  dropOffPoints: Map<string, number>
  averageTimeOnPage: Map<string, number>
  completionRate: number
  errorRate: number
  userFrustration: Map<string, number>
}

export class UXAnalyticsAgent {
  private sessions: Map<string, UserSession> = new Map()
  private metrics: UXMetrics = {
    pageViews: new Map(),
    dropOffPoints: new Map(),
    averageTimeOnPage: new Map(),
    completionRate: 0,
    errorRate: 0,
    userFrustration: new Map(),
  }

  // Отслеживание начала сессии
  trackSessionStart(sessionId: string): void {
    this.sessions.set(sessionId, {
      sessionId,
      startTime: new Date(),
      pages: [],
      actions: [],
      completed: false,
    })
  }

  // Отслеживание действия пользователя
  trackUserAction(
    sessionId: string,
    action: string,
    page: string,
    data?: any
  ): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const userAction: UserAction = {
      action,
      page,
      timestamp: new Date(),
      data,
    }

    session.actions.push(userAction)

    // Если это новая страница, добавляем в список
    if (!session.pages.includes(page)) {
      session.pages.push(page)
    }

    // Обновляем метрики
    this.updateMetrics(userAction)
  }

  // Отслеживание времени на странице
  trackPageTime(
    sessionId: string,
    page: string,
    duration: number
  ): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    // Находим последнее действие на этой странице
    const lastAction = session.actions
      .filter((a) => a.page === page)
      .pop()

    if (lastAction) {
      lastAction.duration = duration
    }

    // Обновляем среднее время на странице
    this.updatePageTimeMetrics(page, duration)
  }

  // Отслеживание выхода пользователя
  trackSessionEnd(
    sessionId: string,
    dropOffPage?: string
  ): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    session.endTime = new Date()
    session.dropOffPage = dropOffPage
    session.completed = dropOffPage === undefined

    // Сохраняем сессию в БД
    this.saveSession(session)

    // Обновляем метрики выхода
    if (dropOffPage) {
      this.metrics.dropOffPoints.set(
        dropOffPage,
        (this.metrics.dropOffPoints.get(dropOffPage) || 0) +
          1
      )
    }
  }

  // Отслеживание ошибок пользователя
  trackUserError(
    sessionId: string,
    error: string,
    page: string
  ): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    // Увеличиваем счетчик фрустрации
    this.metrics.userFrustration.set(
      page,
      (this.metrics.userFrustration.get(page) || 0) + 1
    )

    // Сохраняем ошибку
    this.saveUserError(sessionId, error, page)
  }

  // Обновление метрик
  private updateMetrics(action: UserAction): void {
    // Счетчик просмотров страниц
    this.metrics.pageViews.set(
      action.page,
      (this.metrics.pageViews.get(action.page) || 0) + 1
    )
  }

  // Обновление метрик времени на странице
  private updatePageTimeMetrics(
    page: string,
    duration: number
  ): void {
    const current =
      this.metrics.averageTimeOnPage.get(page) || 0
    const count = this.metrics.pageViews.get(page) || 1
    const newAverage =
      (current * (count - 1) + duration) / count
    this.metrics.averageTimeOnPage.set(page, newAverage)
  }

  // Сохранение сессии в БД
  private async saveSession(
    session: UserSession
  ): Promise<void> {
    try {
      await prisma.agentAnalytics.createMany({
        data: [
          {
            agentType: 'ux_analytics',
            metric: 'session_duration',
            value: session.endTime
              ? session.endTime.getTime() -
                session.startTime.getTime()
              : 0,
            metadata: {
              sessionId: session.sessionId,
              pages: session.pages,
              actions: session.actions.length,
              completed: session.completed,
              dropOffPage: session.dropOffPage,
            },
          },
          {
            agentType: 'ux_analytics',
            metric: 'pages_visited',
            value: session.pages.length,
            metadata: {
              sessionId: session.sessionId,
              pages: session.pages,
            },
          },
        ],
      })
    } catch (error) {
      console.error('Ошибка сохранения сессии:', error)
    }
  }

  // Сохранение ошибки пользователя
  private async saveUserError(
    sessionId: string,
    error: string,
    page: string
  ): Promise<void> {
    try {
      await prisma.agentAnalytics.create({
        data: {
          agentType: 'ux_analytics',
          metric: 'user_error',
          value: 1,
          page,
          metadata: {
            sessionId,
            error,
            timestamp: new Date(),
          },
        },
      })
    } catch (error) {
      console.error(
        'Ошибка сохранения ошибки пользователя:',
        error
      )
    }
  }

  // Анализ и генерация рекомендаций
  async analyzeAndRecommend(): Promise<void> {
    const recommendations = []

    // Анализ точек выхода
    for (const [page, dropOffs] of this.metrics
      .dropOffPoints) {
      const totalViews =
        this.metrics.pageViews.get(page) || 1
      const dropOffRate = (dropOffs / totalViews) * 100

      if (dropOffRate > 30) {
        // Если больше 30% пользователей уходят
        recommendations.push({
          agentType: 'ux_analytics',
          priority: 'high',
          category: 'ux',
          title: `Высокий процент выхода на странице ${page}`,
          description: `${dropOffRate.toFixed(
            1
          )}% пользователей покидают приложение на странице ${page}`,
          solution:
            'Упростить интерфейс, добавить подсказки, улучшить навигацию',
          page,
          metadata: { dropOffRate, totalViews, dropOffs },
        })
      }
    }

    // Анализ времени на странице
    for (const [page, avgTime] of this.metrics
      .averageTimeOnPage) {
      if (avgTime > 60000) {
        // Больше минуты
        recommendations.push({
          agentType: 'ux_analytics',
          priority: 'medium',
          category: 'ux',
          title: `Пользователи долго находятся на странице ${page}`,
          description: `Среднее время на странице: ${(
            avgTime / 1000
          ).toFixed(1)} секунд`,
          solution:
            'Упростить процесс, добавить прогресс-бар, улучшить инструкции',
          page,
          metadata: { avgTime },
        })
      }
    }

    // Анализ фрустрации пользователей
    for (const [page, frustration] of this.metrics
      .userFrustration) {
      if (frustration > 5) {
        // Больше 5 ошибок
        recommendations.push({
          agentType: 'ux_analytics',
          priority: 'critical',
          category: 'ux',
          title: `Высокий уровень фрустрации на странице ${page}`,
          description: `${frustration} ошибок зафиксировано на странице ${page}`,
          solution:
            'Пересмотреть UX, добавить валидацию, улучшить подсказки',
          page,
          metadata: { frustration },
        })
      }
    }

    // Сохраняем рекомендации в БД
    if (recommendations.length > 0) {
      await prisma.agentRecommendation.createMany({
        data: recommendations,
      })
    }
  }

  // Получение статистики UX
  async getUXStats(): Promise<{
    totalSessions: number
    completionRate: number
    averageSessionDuration: number
    topDropOffPages: Array<{ page: string; count: number }>
    averageTimeOnPage: Array<{ page: string; time: number }>
    errorRate: number
  }> {
    const sessions = await prisma.agentAnalytics.findMany({
      where: { agentType: 'ux_analytics' },
      orderBy: { createdAt: 'desc' },
    })

    const sessionData = sessions.filter(
      (s) => s.metric === 'session_duration'
    )
    const completedSessions = sessionData.filter(
      (s) =>
        s.metadata &&
        typeof s.metadata === 'object' &&
        'completed' in s.metadata &&
        s.metadata.completed === true
    )
    const totalSessions = sessionData.length
    const completionRate =
      totalSessions > 0
        ? (completedSessions.length / totalSessions) * 100
        : 0
    const averageSessionDuration =
      sessionData.reduce((sum, s) => sum + s.value, 0) /
        totalSessions || 0

    // Топ страниц выхода
    const dropOffData = sessions.filter(
      (s) => s.metric === 'user_error'
    )
    const dropOffCounts = new Map<string, number>()
    dropOffData.forEach((s) => {
      const page = s.page || 'unknown'
      dropOffCounts.set(
        page,
        (dropOffCounts.get(page) || 0) + 1
      )
    })

    const topDropOffPages = Array.from(
      dropOffCounts.entries()
    )
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalSessions,
      completionRate,
      averageSessionDuration,
      topDropOffPages,
      averageTimeOnPage: [], // TODO: реализовать
      errorRate: 0, // TODO: реализовать
    }
  }

  // Получение рекомендаций
  async getRecommendations(): Promise<any[]> {
    return await prisma.agentRecommendation.findMany({
      where: { agentType: 'ux_analytics' },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })
  }
}
