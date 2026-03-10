import { api } from '@/services/api'

export interface RequestData {
  telegramId: string
  username?: string
  currentStep?: string
  modelname?: string
  price?: number
  deviceConditions?: any
  additionalConditions?: any
  imei?: string
  sn?: string
  priceRange?: any
  deviceData?: any
  aiAnalysis?: any
  chatHistory?: any
  aiModelUsed?: string
  analysisConfidence?: number
  courier?: any
  photoUrls?: string[]
  videoUrls?: string[]
  [key: string]: any
}

export class RequestManager {
  /**
   * Получить или создать активную заявку пользователя
   * Принцип: всегда возвращаем одну заявку на пользователя
   */
  static async getOrCreateActiveRequest(
    telegramId: string,
    initialData?: Partial<RequestData>
  ) {
    // Ищем активную заявку (draft или submitted) через Go API
    const requests = await api.list<any>('skupka', {
      telegramId,
      status: 'draft,submitted',
      order_by: 'updatedAt desc',
      limit: 1,
    })
    
    let activeRequest = requests[0]

    // Если нет активной заявки, создаем новую через Go API
    if (!activeRequest) {
      console.log(
        `🆕 Создаем новую заявку для telegramId: ${telegramId}`
      )

      activeRequest = await api.create<any>('skupka', {
          telegramId,
          username: initialData?.username || 'Unknown',
          status: 'draft',
          currentStep:
            initialData?.currentStep || 'evaluation-mode',
          modelname: initialData?.modelname || null,
          price: initialData?.price ?? null,
          deviceConditions:
            initialData?.deviceConditions || null,
          additionalConditions:
            initialData?.additionalConditions || null,
          imei: initialData?.imei || null,
          sn: initialData?.sn || null,
          priceRange: initialData?.priceRange || null,
          deviceData: initialData?.deviceData || null,
          aiAnalysis: initialData?.aiAnalysis || null,
          chatHistory: initialData?.chatHistory || null,
          aiModelUsed: initialData?.aiModelUsed || null,
          analysisConfidence:
            initialData?.analysisConfidence || null,
          courier: initialData?.courier || null,
          photoUrls: initialData?.photoUrls || [],
          videoUrls: initialData?.videoUrls || [],
      })

      console.log(
        `✅ Создана заявка ID: ${activeRequest.id}`
      )
    } else {
      console.log(
        `🔄 Найдена активная заявка ID: ${activeRequest.id}`
      )
    }

    return activeRequest
  }

  /**
   * Обновить активную заявку
   * Принцип: всегда обновляем существующую заявку
   */
  static async updateActiveRequest(
    telegramId: string,
    updateData: Partial<RequestData>
  ) {
    const activeRequest =
      await this.getOrCreateActiveRequest(telegramId)

    console.log(
      `🔄 Обновляем заявку ID: ${activeRequest.id}`
    )
    
    // В Go API updatedAt обновляется автоматически GORM'ом
    const updatedRequest = await api.patch<any>('skupka', activeRequest.id, updateData)

    console.log(
      `✅ Заявка обновлена ID: ${updatedRequest.id}`
    )

    return updatedRequest
  }

  /**
   * Получить активную заявку по ID
   */
  static async getRequestById(requestId: string) {
    return await api.get<any>('skupka', requestId)
  }

  /**
   * Получить активную заявку по telegramId
   */
  static async getActiveRequestByTelegramId(
    telegramId: string
  ) {
    const requests = await api.list<any>('skupka', {
      telegramId,
      status: 'draft,submitted',
      order_by: 'updatedAt desc',
      limit: 1,
    })
    return requests[0] || null
  }

  /**
   * Завершить заявку (перевести в submitted)
   */
  static async submitRequest(
    telegramId: string,
    finalData: Partial<RequestData>
  ) {
    const activeRequest =
      await this.getOrCreateActiveRequest(telegramId)

    console.log(
      `📤 Завершаем заявку ID: ${activeRequest.id}`
    )

    const submittedRequest = await api.patch<any>('skupka', activeRequest.id, {
        ...finalData,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
    })

    console.log(
      `✅ Заявка завершена ID: ${submittedRequest.id}`
    )

    return submittedRequest
  }

  /**
   * Очистить все черновики пользователя
   */
  static async clearDraft(telegramId: string) {
    console.log(`🧹 Очищаем черновики для telegramId: ${telegramId}`)
    
    const drafts = await api.list<any>('skupka', {
      telegramId,
      status: 'draft',
    })

    for (const draft of drafts) {
      await api.delete('skupka', draft.id)
    }

    return { count: drafts.length }
  }
}
