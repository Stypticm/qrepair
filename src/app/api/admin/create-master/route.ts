import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const {
      adminTelegramId,
      telegramId,
      username,
      name,
      pointId,
    } = await req.json()

    if (!adminTelegramId) {
      return NextResponse.json(
        { error: 'Admin Telegram ID is required' },
        { status: 400 }
      )
    }

    // Проверяем, что пользователь является админом
    const admin = await prisma.master.findUnique({
      where: { telegramId: adminTelegramId },
    })

    if (
      !admin ||
      (admin.telegramId !== '1' &&
        admin.telegramId !== '531360988' &&
        admin.telegramId !== '296925626')
    ) {
      // Только главные админы
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Проверяем обязательные поля
    if (!telegramId || !username || !name) {
      return NextResponse.json(
        {
          error:
            'Telegram ID, username and name are required',
        },
        { status: 400 }
      )
    }

    // Проверяем, что мастер с таким telegramId не существует
    const existingMaster = await prisma.master.findUnique({
      where: { telegramId },
    })

    if (existingMaster) {
      return NextResponse.json(
        {
          error:
            'Master with this Telegram ID already exists',
        },
        { status: 400 }
      )
    }

    // Проверяем, что точка существует (если указана)
    if (pointId) {
      const point = await prisma.point.findUnique({
        where: { id: parseInt(pointId) },
      })

      if (!point) {
        return NextResponse.json(
          { error: 'Point not found' },
          { status: 400 }
        )
      }
    }

    // Создаем мастера
    const master = await prisma.master.create({
      data: {
        telegramId,
        username,
        name,
        isActive: true,
        pointId: pointId ? parseInt(pointId) : null,
      },
      include: { point: true },
    })

    return NextResponse.json({ success: true, master })
  } catch (error) {
    console.error('Error creating master:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
