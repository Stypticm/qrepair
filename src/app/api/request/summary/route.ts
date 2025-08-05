import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const telegramId = searchParams.get('telegramId')

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Missing telegramId' },
      { status: 400 }
    )
  }

  const draft = await prisma.skupka.findFirst({
    where: { telegramId, status: 'draft' },
  })

  console.log(draft)

  if (!draft) {
    return NextResponse.json(
      { error: 'Repair request not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(draft)
}

export async function PATCH(req: Request) {
  const body = await req.json()

  const { telegramId } = body

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Invalid request' },
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
    where: { id: draft.id, status: 'draft' },
    data: { status: 'accepted' },
  })

  return NextResponse.json({ success: true, updated })
}
