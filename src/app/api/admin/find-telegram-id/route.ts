import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Ищем в таблице мастеров
    const master = await prisma.master.findFirst({
      where: { username },
    })

    if (master) {
      return NextResponse.json({
        success: true,
        telegramId: master.telegramId,
        source: 'master',
      })
    }

    // Ищем в таблице заявок (пользователи)
    const user = await prisma.skupka.findFirst({
      where: { username },
    })

    if (user) {
      return NextResponse.json({
        success: true,
        telegramId: user.telegramId,
        source: 'user',
      })
    }

    return NextResponse.json({
      success: false,
      telegramId: null,
      message: 'User not found',
    })
  } catch (error) {
    console.error('Error finding Telegram ID:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
