import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 🔥 ВАЖНО: Этот лог должен быть виден в серверной консоли!
    console.log('🔥🔥🔥 API getConditions ВЫЗВАН! 🔥🔥🔥')

    // Получаем telegramId из заголовков
    const telegramId =
      request.headers.get('x-telegram-id') || 'test-user'
    console.log('API GET: telegramId:', telegramId)

    // Ищем активную заявку для данного telegramId
    const activeRequest = await prisma.skupka.findFirst({
      where: { telegramId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        deviceConditions: true,
        modelname: true,
        phoneData: true,
        price: true,
        status: true,
      },
    })

    if (activeRequest) {
      const response = NextResponse.json({
        success: true,
        deviceConditions:
          activeRequest.deviceConditions || null,
        modelname: activeRequest.modelname,
        phoneData: activeRequest.phoneData,
        price: activeRequest.price,
        status: activeRequest.status,
      })

      // Отключаем кэширование
      response.headers.set(
        'Cache-Control',
        'no-cache, no-store, must-revalidate'
      )
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')

      console.log(
        '🔥🔥🔥 API getConditions ЗАВЕРШЕН! 🔥🔥🔥'
      )
      return response
    } else {
      const response = NextResponse.json({
        success: true,
        deviceConditions: null,
      })

      response.headers.set(
        'Cache-Control',
        'no-cache, no-store, must-revalidate'
      )
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')

      console.log(
        '🔥🔥🔥 API getConditions ЗАВЕРШЕН! 🔥🔥🔥'
      )
      return response
    }
  } catch (error) {
    console.error(
      '🔥🔥🔥 Ошибка в API getConditions:',
      error
    )
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
