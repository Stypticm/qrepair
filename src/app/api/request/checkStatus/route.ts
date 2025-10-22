import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { telegramId } = await request.json()

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID required' },
        { status: 400 }
      )
    }

    // Проверяем существование активной заявки
    const activeRequest = await prisma.skupka.findFirst({
      where: {
        telegramId,
        status: 'draft',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        currentStep: true,
        updatedAt: true,
      },
    })

    if (!activeRequest) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: 'No active request found',
      })
    }

    return NextResponse.json({
      success: true,
      exists: true,
      request: {
        id: activeRequest.id,
        status: activeRequest.status,
        currentStep: activeRequest.currentStep,
        updatedAt: activeRequest.updatedAt,
      },
    })
  } catch (error) {
    console.error('Check status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
