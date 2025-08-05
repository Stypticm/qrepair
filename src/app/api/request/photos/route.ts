import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { telegramId, photoUrls } = body

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const photos = photoUrls.filter(
      (url: string): url is string =>
        url !== null && url.trim() !== ''
    )

    if (photos.length > 6) {
      return NextResponse.json(
        { error: 'Maximum 6 photos allowed' },
        { status: 400 }
      )
    }

    const draft = await prisma.skupka.findFirst({
      where: { telegramId, status: 'draft' },
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'Repair request not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.skupka.update({
      where: { id: draft.id },
      data: { photoUrls: photos },
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
