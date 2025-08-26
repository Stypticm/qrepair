import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

interface QuestionsRequest {
  telegramId: string
  answers: number[]
  comment?: string
}

// Пункты "штрафов" за каждый дефект (в %)
// Вопросы: 1-7: "Да" = есть дефект, "Нет" = нет дефекта
// Вопрос 8: "Да" = работает хорошо, "Нет" = не работает
const penalties = [35, 30, 25, 20, 15, 8, 20, 15]

function calculateDamage(answers: number[]) {
  const totalDamage = answers.reduce((sum, val, i) => {
    // Для последнего вопроса (индекс 7) логика обратная:
    // 0 = работает хорошо, 1 = не работает
    if (i === 7) {
      return sum + (val === 1 ? penalties[i] : 0)
    }
    // Для остальных вопросов: 1 = есть дефект, 0 = нет дефекта
    return sum + (val === 1 ? penalties[i] : 0)
  }, 0)

  // Ограничиваем максимальный штраф 80% от базовой цены
  // Это означает, что минимальная цена будет 20% от базовой
  return Math.min(totalDamage, 80)
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
