import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { telegramId, username, serialNumber } = body

    console.log('🔍 API device-info: Получены данные:', {
      telegramId,
      username,
      serialNumber,
    })

    if (!telegramId || !serialNumber) {
      console.error(
        '❌ API device-info: Отсутствуют обязательные поля',
        { telegramId, serialNumber }
      )
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Ищем существующую заявку
    console.log(
      '🔍 API device-info: Ищем существующую заявку для telegramId:',
      telegramId
    )
    let existingRequest = await prisma.skupka.findFirst({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (existingRequest) {
      console.log(
        '✅ API device-info: Найдена существующая заявка, обновляем:',
        existingRequest.id
      )
      // Обновляем существующую заявку
      const updatedRequest = await prisma.skupka.update({
        where: { id: existingRequest.id },
        data: {
          username: username || existingRequest.username,
          sn: serialNumber,
          currentStep: 'device-info',
          updatedAt: new Date(),
        },
      })

      console.log(
        '✅ API device-info: Заявка обновлена:',
        updatedRequest
      )
      return NextResponse.json({
        success: true,
        request: updatedRequest,
      })
    } else {
      console.log(
        '🆕 API device-info: Создаем новую заявку'
      )
      // Создаем новую заявку
      const newRequest = await prisma.skupka.create({
        data: {
          telegramId: telegramId,
          username: username || 'Unknown',
          sn: serialNumber,
          status: 'draft',
          currentStep: 'device-info',
        },
      })

      console.log(
        '✅ API device-info: Новая заявка создана:',
        newRequest
      )
      return NextResponse.json({
        success: true,
        request: newRequest,
      })
    }
  } catch (error) {
    console.error(
      '❌ API device-info: Ошибка при сохранении:',
      error
    )
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
