import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const body = await req.json()
  const { telegramId, modelname } = body

  if (!telegramId || !modelname?.trim()) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  try {
    const draft = await prisma.skupka.findFirst({
      where: { telegramId, status: 'draft' },
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'No draft found' },
        { status: 404 }
      )
    }

    const updated = await prisma.skupka.update({
      where: { id: draft.id },
      data: { modelname: modelname.trim() },
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
