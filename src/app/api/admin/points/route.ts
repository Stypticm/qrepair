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

    const points = await prisma.point.findMany({
      orderBy: { id: 'asc' },
    })

    return NextResponse.json({ points })
  } catch (error) {
    console.error('Error fetching points:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
