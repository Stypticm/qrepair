import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const body = await req.json()
  const { telegramId, crash, crashDescription } = body

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  let crashText: string | null = null

  if (crashDescription?.trim()) {
    crashText = crashDescription.trim()
  } else if (crash && Array.isArray(crash)) {
    crashText = crash.join(', ')
  } else {
    return NextResponse.json(
      { error: 'Insufficient data to update crash info' },
      { status: 400 }
    )
  }

  try {
    const draft = await prisma.repairRequest.findFirst({
      where: { telegramId, status: 'draft' },
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft request not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.repairRequest.update({
      where: { id: draft.id },
      data: {
        crash: crashText,
        currentStep: 2,
      },
    })

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error updating crash info' },
      { status: 500 }
    )
  }
}
