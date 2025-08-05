import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const telegramId = searchParams.get('telegramId')

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Missing telegramId' },
      { status: 400 }
    )
  }

  try {
    const devices = await prisma.skupka.findMany({
      where: { telegramId },
    })
    return NextResponse.json(devices)
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
