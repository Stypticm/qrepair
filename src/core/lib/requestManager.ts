/**
 * Централизованный менеджер заявок
 * Принцип единой истины: одна заявка на весь путь воронки
 */

import prisma from '@/core/lib/prisma'

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
    // Ищем активную заявку (draft или submitted)
    let activeRequest = await prisma.skupka.findFirst({
      where: {
        telegramId,
        status: { in: ['draft', 'submitted'] },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Если нет активной заявки, создаем новую
    if (!activeRequest) {
      console.log(
        `🆕 Создаем новую заявку для telegramId: ${telegramId}`
      )

      activeRequest = await prisma.skupka.create({
        data: {
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
        },
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

    const updatedRequest = await prisma.skupka.update({
      where: { id: activeRequest.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    })

    console.log(
      `✅ Заявка обновлена ID: ${updatedRequest.id}`
    )

    return updatedRequest
  }

  /**
   * Получить активную заявку по ID
   */
  static async getRequestById(requestId: string) {
    return await prisma.skupka.findUnique({
      where: { id: requestId },
    })
  }

  /**
   * Получить активную заявку по telegramId
   */
  static async getActiveRequestByTelegramId(
    telegramId: string
  ) {
    return await prisma.skupka.findFirst({
      where: {
        telegramId,
        status: { in: ['draft', 'submitted'] },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
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

    const submittedRequest = await prisma.skupka.update({
      where: { id: activeRequest.id },
      data: {
        ...finalData,
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    console.log(
      `✅ Заявка завершена ID: ${submittedRequest.id}`
    )

    return submittedRequest
  }
}
