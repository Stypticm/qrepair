import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { isAdminTelegramId } from '@/core/lib/admin'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const adminTelegramId = searchParams.get('adminTelegramId')

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

    const masters = await prisma.master.findMany({
      include: { point: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ masters })
  } catch (error) {
    console.error('Error fetching masters:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
