import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const telegramId = searchParams.get('telegramId')

  if (!telegramId) {
    return NextResponse.json(
      { error: 'telegramId is required' },
      { status: 400 }
    )
  }

  try {
    const draft = await prisma.repairRequest.findFirst({
      where: {
        telegramId,
        status: 'draft',
      },
    })

    if (draft) {
      return NextResponse.json({ existing: draft })
    }

    return NextResponse.json({ existing: null })
  } catch (error) {
    console.error('Error fetching step:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
