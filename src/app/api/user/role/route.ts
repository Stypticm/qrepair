import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-id')

    if (!telegramId) {
      return NextResponse.json({ role: null }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { telegramId },
      select: { role: true },
    })

    return NextResponse.json({ role: user?.role || null })
  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json({ role: null }, { status: 500 })
  }
}
