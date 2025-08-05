import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  let { telegramId, username } = body

  if (!username) username = 'local_dev'
  if (!telegramId || !username) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  const existing = await prisma.skupka.findFirst({
    where: { telegramId, status: 'draft' },
  })

  if (existing) {
    return NextResponse.json({ id: existing.id })
  }

  const created = await prisma.skupka.create({
    data: {
      telegramId,
      username,
      status: 'draft',
    },
  })

  return NextResponse.json({ id: created.id })
}
