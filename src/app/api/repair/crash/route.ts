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

  let crashArray: string[] | null = null

  if (crashDescription?.trim()) {
    crashArray = [crashDescription.trim()]
  } else if (Array.isArray(crash) && crash.length > 0) {
    crashArray = crash
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
        crash: crashArray,
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
