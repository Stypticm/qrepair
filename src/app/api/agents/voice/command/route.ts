import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json()

    if (!command) {
      return NextResponse.json(
        {
          success: false,
          message: 'Команда не предоставлена',
        },
        { status: 400 }
      )
    }

    // Сохраняем команду в БД
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

    return NextResponse.json({
      success: true,
      message: 'Команда сохранена',
      command,
    })
  } catch (error) {
    console.error(
      'Ошибка сохранения голосовой команды:',
      error
    )
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка сохранения команды',
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
