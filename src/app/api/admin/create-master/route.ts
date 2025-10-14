import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { isAdminTelegramId } from '@/core/lib/admin'

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

    if (!isAdminTelegramId(adminTelegramId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    if (!telegramId || !username || !name) {
      return NextResponse.json(
        {
          error:
            'Telegram ID, username and name are required',
        },
        { status: 400 }
      )
    }

    const existingMaster = await prisma.master.findUnique({
      where: { telegramId },
    })

    if (existingMaster) {
      return NextResponse.json(
        {
          error: 'Master with this Telegram ID already exists',
        },
        { status: 400 }
      )
    }

    if (pointId) {
      const point = await prisma.point.findUnique({
        where: { id: Number(pointId) },
      })

      if (!point) {
        return NextResponse.json(
          { error: 'Point not found' },
          { status: 400 }
        )
      }
    }

    const master = await prisma.master.create({
      data: {
        telegramId,
        username,
        name,
        isActive: true,
        pointId: pointId ? Number(pointId) : null,
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
