import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const body = await req.json()
  const {
    telegramId,
    brandname,
    modelname,
    brandModelText,
  } = body

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  const dataToUpdate: Record<string, unknown> = {}

  if (brandModelText?.trim()) {
    dataToUpdate.brandModelText = brandModelText.trim()

    dataToUpdate.brandname = null
    dataToUpdate.modelname = null
  } else if (brandname && modelname?.trim()) {
    dataToUpdate.brandname = brandname
    dataToUpdate.modelname = modelname.trim()
    dataToUpdate.brandModelText = null
  } else {
    return NextResponse.json(
      { error: 'Insufficient data to update brand info' },
      { status: 400 }
    )
  }

  try {
    const draft = await prisma.repairRequest.findFirst({
      where: { telegramId, status: 'draft' },
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'No draft request found' },
        { status: 400 }
      )
    }

    const updated = await prisma.repairRequest.update({
      where: { id: draft.id },
      data: {
        ...dataToUpdate,
        currentStep: 1,
      },
    })
    return NextResponse.json({ succes: true, updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error updating brand info' },
      { status: 500 }
    )
  }
}
