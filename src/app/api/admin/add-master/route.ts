import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { telegramId, username, name } = body

    if (!telegramId || !username) {
      return NextResponse.json(
        { error: 'Missing telegramId or username' },
        { status: 400 }
      )
    }

    // Проверяем, не существует ли уже мастер с таким telegramId или username
    const existingMaster = await prisma.master.findFirst({
      where: {
        OR: [{ telegramId }, { username }],
      },
    })

    if (existingMaster) {
      return NextResponse.json(
        {
          error:
            'Master already exists with this telegramId or username',
        },
        { status: 409 }
      )
    }

    // Создаём нового мастера
    const master = await prisma.master.create({
      data: {
        telegramId,
        username,
        name: name || username,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      master: {
        id: master.id,
        telegramId: master.telegramId,
        username: master.username,
        name: master.name,
      },
    })
  } catch (error) {
    console.error('Error adding master:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
