import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const bids = await prisma.repairRequest.findMany()
    return NextResponse.json(bids)
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { telegramId } = body

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Missing telegramId' },
        { status: 400 }
      )
    }

    const updated = await prisma.repairRequest.updateMany({
      where: {
        telegramId,
        status: 'submitted', // обновляем только если статус submitted
      },
      data: {
        status: 'in_progress', // новое состояние, не забудь добавить его в enum
      },
    })

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
