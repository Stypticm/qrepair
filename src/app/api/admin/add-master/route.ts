import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import prisma from '@/core/lib/prisma';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json()
    const { telegramId, username, name, pointId } = body

    if (!telegramId || !username) {
      return NextResponse.json(
        { error: 'Missing telegramId or username' },
        { status: 400 }
      )
    }

    const existingMaster = await prisma.master.findFirst({
      where: {
        OR: [{ telegramId }, { username }],
      },
    })

    if (existingMaster) {
      return NextResponse.json(
        { error: 'Master already exists with this telegramId or username' },
        { status: 409 }
      )
    }

    const master = await prisma.master.create({
      data: {
        telegramId,
        username,
        name: name || username,
        isActive: true,
        pointId: pointId ? parseInt(pointId) : null,
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
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
