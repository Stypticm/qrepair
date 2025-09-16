import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const telegramId = searchParams.get('telegramId')
    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      )
    }

    const origin = new URL(req.url).origin
    const [requestsRes, pointsRes] = await Promise.all([
      fetch(
        `${origin}/api/master/requests?masterTelegramId=${telegramId}`,
        { cache: 'no-store' }
      ),
      fetch(
        `${origin}/api/master/points?telegramId=${telegramId}`,
        { next: { revalidate: 30 } }
      ),
    ])

    const [requestsData, pointsData] = await Promise.all([
      requestsRes.json(),
      pointsRes.json(),
    ])

    if (!requestsRes.ok)
      return NextResponse.json(
        {
          error:
            requestsData.error ||
            'Failed to fetch requests',
        },
        { status: 500 }
      )
    if (!pointsRes.ok)
      return NextResponse.json(
        {
          error:
            pointsData.error || 'Failed to fetch points',
        },
        { status: 500 }
      )
    // allPoints временно совпадает с points для уменьшения запросов

    // Обрезаем поля до нужного минимума
    const requests = (requestsData.requests || []).map(
      (r: any) => ({
        id: r.id,
        modelname: r.modelname,
        price: r.price,
        username: r.username,
        status: r.status,
        createdAt: r.createdAt,
      })
    )

    return NextResponse.json({
      requests,
      points: pointsData.points || [],
      allPoints: pointsData.points || [],
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
