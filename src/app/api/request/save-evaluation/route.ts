import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { telegramId, userEvaluation, damagePercent } =
      await req.json()

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      )
    }

    const updatedSkupka = await prisma.skupka.updateMany({
      where: {
        telegramId: String(telegramId),
        status: 'draft',
      },
      data: {
        userEvaluation,
        damagePercent,
        currentStep: 'submit',
      },
    })

    if (updatedSkupka.count === 0) {
      // If no draft was found, create a new one
      await prisma.skupka.create({
        data: {
          telegramId: String(telegramId),
          username: 'Unknown', // Or get it from the request if available
          userEvaluation,
          damagePercent,
          status: 'draft',
          currentStep: 'submit',
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving evaluation:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
