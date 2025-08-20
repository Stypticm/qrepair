import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

interface QuestionsRequest {
  telegramId: string
  answers: number[]
  comment?: string
}

// Пункты "штрафов" за каждый дефект (в %)
const penalties = [3, 2, 4, 5, 2, 3, 6, 4]

function calculateDamage(answers: number[]) {
  return answers.reduce(
    (sum, val, i) => sum + (val === 1 ? penalties[i] : 0),
    0
  )
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const telegramId = searchParams.get('telegramId')

  if (!telegramId)
    return NextResponse.json(
      { error: 'Missing telegramId' },
      { status: 400 }
    )

  const draft = await prisma.skupka.findFirst({
    where: { telegramId, status: 'draft' },
  })
  if (!draft)
    return NextResponse.json(
      { error: 'No draft found' },
      { status: 404 }
    )

  return NextResponse.json({ draft })
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as QuestionsRequest
  const { telegramId, answers, comment } = body

  if (
    !telegramId ||
    !Array.isArray(answers) ||
    answers.length !== 8
  ) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  const draft = await prisma.skupka.findFirst({
    where: { telegramId, status: 'draft' },
  })
  if (!draft)
    return NextResponse.json(
      { error: 'No draft found' },
      { status: 404 }
    )

  const damagePercent = calculateDamage(answers)
  const basePriceMap: Record<string, number> = {
    'Apple Iphone 13': 48000,
    'Apple Iphone 13 Pro': 56000,
    'Apple Iphone 13 Pro Max': 64000,
    'Apple Iphone 14': 56000,
    'Apple Iphone 14 Pro': 72000,
    'Apple Iphone 14 Pro Max': 80000,
  }
  const basePrice = basePriceMap[draft.modelname || ''] || 0
  const finalPrice =
    Math.floor(
      (basePrice * (1 - damagePercent / 100)) / 100
    ) * 100

  const updated = await prisma.skupka.update({
    where: { id: draft.id },
    data: {
      answers,
      questionsAnswered: true,
      damagePercent,
      price: finalPrice,
      ...(comment && comment.trim()
        ? { comment: comment.trim() }
        : {}),
    },
  })

  return NextResponse.json({ success: true, updated })
}
