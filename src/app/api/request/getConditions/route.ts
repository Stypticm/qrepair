import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Получаем telegramId из body
    const { telegramId } = await request.json()

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID required' },
        { status: 400 }
      )
    }

    // Ищем активную заявку для данного telegramId
    const activeRequest = await prisma.skupka.findFirst({
      where: { telegramId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        deviceConditions: true,
        modelname: true,
        deviceData: true,
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
        deviceData: (activeRequest as any).deviceData,
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

      return response
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
