import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

interface QuestionsRequest {
  telegramId: string
  answers: number[]
}

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
    const draft = await prisma.skupka.findFirst({
      where: { telegramId, status: 'draft' },
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'Repair request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ draft })
  } catch (error) {
    console.error('Error fetching draft:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { telegramId, answers } = body as QuestionsRequest

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  if (!Array.isArray(answers) || answers.length !== 8) {
    return NextResponse.json(
      { error: 'Invalid answers array' },
      { status: 400 }
    )
  }

  try {
    const draft = await prisma.skupka.findFirst({
      where: { telegramId, status: 'draft' },
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'No draft request found' },
        { status: 400 }
      )
    }

    const updated = await prisma.skupka.update({
      where: { id: draft.id },
      data: { answers },
    })
    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error updating answers' },
      { status: 500 }
    )
  }
}
