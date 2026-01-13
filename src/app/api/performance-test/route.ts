import { NextRequest, NextResponse } from 'next/server'

// Кэш для демонстрации
const cache = new Map<
  string,
  { data: any; timestamp: number }
>()
const CACHE_TTL = 5 * 60 * 1000 // 5 минут

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key') || 'default'

  // Проверяем кэш
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({
      data: cached.data,
      cached: true,
      timestamp: cached.timestamp,
    })
  }

  // Имитируем медленную операцию
  await new Promise((resolve) => setTimeout(resolve, 100))

  const data = {
    message: `Hello from ${key}`,
    timestamp: Date.now(),
    random: Math.random(),
  }

  // Сохраняем в кэш
  cache.set(key, { data, timestamp: Date.now() })

  return NextResponse.json({
    data,
    cached: false,
    timestamp: Date.now(),
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Валидация
  if (!body.message) {
    return NextResponse.json(
      { error: 'Message is required' },
      { status: 400 }
    )
  }

  // Обработка
  const result = {
    received: body.message,
    processed: true,
    timestamp: Date.now(),
  }

  return NextResponse.json(result)
}
