import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const body = await req.json()
  const { telegramId, picture1, picture2, noPhotos } = body

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  const photoUrls: string[] = noPhotos
    ? []
    : [picture1, picture2].filter(Boolean)

  try {
    const draft = await prisma.repairRequest.findFirst({
      where: { telegramId, status: 'draft' },
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'Repair request not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.repairRequest.update({
      where: { id: draft.id },
      data: { photoUrls, currentStep: 3 },
    })

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to update repair request' },
      { status: 500 }
    )
  }
}
