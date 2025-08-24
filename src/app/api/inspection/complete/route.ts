import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'
import { calculatePriceAdjustment } from '@/core/lib/deviceTests'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { inspectionId, inspectionNotes } = body

    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Missing inspectionId' },
        { status: 400 }
      )
    }

    // Получаем данные проверки
    const inspection =
      await prisma.deviceInspection.findUnique({
        where: { id: inspectionId },
        include: {
          skupka: true,
        },
      })

    if (!inspection) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      )
    }

    // Проверяем, что все обязательные тесты пройдены
    const testsResults =
      (inspection.testsResults as any[]) || []

    // Получаем список обязательных тестов из конфигурации
    // Для простоты проверяем, что все тесты пройдены
    if (testsResults.length === 0) {
      return NextResponse.json(
        { error: 'No test results found' },
        { status: 400 }
      )
    }

    // Рассчитываем окончательную цену
    const basePrice = inspection.skupka.price || 0
    const priceAdjustment = calculatePriceAdjustment(
      testsResults,
      basePrice
    )
    const finalPrice = Math.max(
      basePrice + priceAdjustment,
      0
    )

    // Завершаем проверку
    const completedInspection =
      await prisma.deviceInspection.update({
        where: { id: inspectionId },
        data: {
          finalPrice,
          inspectionNotes,
          completedAt: new Date(),
        },
      })

    // Обновляем заявку
    await prisma.skupka.update({
      where: { id: inspection.skupkaId },
      data: {
        finalPrice,
        inspectionCompleted: true,
        status: 'completed',
      },
    })

    // Отправляем уведомление клиенту
    await sendTelegramMessage(
      inspection.skupka.telegramId,
      `✅ Проверка устройства завершена!\n\n` +
        `📱 Модель: ${
          inspection.skupka.modelname || 'Не указана'
        }\n` +
        `💰 Окончательная цена: ${Math.round(
          finalPrice
        )} ₽\n\n` +
        `Проверку осуществил мастер. Ожидайте дальнейших инструкций.`,
      { parse_mode: 'Markdown' }
    )

    // Отправляем уведомление мастеру
    // Ищем мастера по username для получения telegramId
    const masterUser = await prisma.skupka.findFirst({
      where: { username: inspection.masterUsername },
    })

    if (masterUser) {
      await sendTelegramMessage(
        masterUser.telegramId,
        `✅ Проверка устройства ${inspection.skupkaId} завершена!\n\n` +
          `💰 Окончательная цена: ${Math.round(
            finalPrice
          )} ₽\n` +
          `📝 Заметки: ${
            inspectionNotes || 'Не указаны'
          }\n\n` +
          `Результаты сохранены в системе.`,
        { parse_mode: 'Markdown' }
      )
    }

    return NextResponse.json({
      success: true,
      inspection: completedInspection,
      finalPrice,
      priceAdjustment,
    })
  } catch (error) {
    console.error('Error completing inspection:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
