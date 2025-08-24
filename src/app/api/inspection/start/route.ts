import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

// Генерация 6-значного OTP токена
function generateOTP(): string {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { skupkaId, masterUsername } = body

    if (!skupkaId || !masterUsername) {
      return NextResponse.json(
        { error: 'Missing skupkaId or masterUsername' },
        { status: 400 }
      )
    }

    // Проверяем, что заявка существует
    const skupka = await prisma.skupka.findUnique({
      where: { id: skupkaId },
    })

    if (!skupka) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Ищем мастера по username в базе данных
    const masterUser = await prisma.skupka.findFirst({
      where: {
        username: masterUsername,
      },
    })

    if (!masterUser) {
      return NextResponse.json(
        { error: 'Master not found with this username' },
        { status: 404 }
      )
    }

    // Проверяем, что мастер назначен к этой заявке
    if (
      skupka.courierTelegramId !== masterUser.telegramId
    ) {
      return NextResponse.json(
        { error: 'Master not assigned to this request' },
        { status: 403 }
      )
    }

    // Генерируем OTP токен
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 минут

    // Создаём или обновляем запись проверки
    const inspection = await prisma.deviceInspection.upsert(
      {
        where: {
          id: `${skupkaId}_${masterUsername}`, // Временное решение
        },
        update: {
          inspectionToken: otp,
          tokenExpiresAt: expiresAt,
        },
        create: {
          skupkaId,
          masterUsername,
          inspectionToken: otp,
          tokenExpiresAt: expiresAt,
          testsResults: [],
        },
      }
    )

    // Отправляем OTP мастеру в Telegram по его telegramId
    await sendTelegramMessage(
      masterUser.telegramId,
      `🔐 Код для проверки устройства: *${otp}*\n\n` +
        `Заявка: ${skupkaId}\n` +
        `Модель: ${skupka.modelname || 'Не указана'}\n` +
        `Код действителен 15 минут\n\n` +
        `Используйте этот код для доступа к тестам устройства.`,
      { parse_mode: 'Markdown' }
    )

    return NextResponse.json({
      success: true,
      inspectionId: inspection.id,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Error starting inspection:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
