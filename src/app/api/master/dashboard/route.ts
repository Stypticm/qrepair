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

    const [requestsRes, pointsRes, allPointsRes] =
      await Promise.all([
        fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || ''
          }/api/master/requests?masterTelegramId=${telegramId}`,
          { cache: 'no-store' }
        ),
        fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || ''
          }/api/master/points?telegramId=${telegramId}`,
          { next: { revalidate: 30 } }
        ),
        fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || ''
          }/api/admin/points?adminTelegramId=${telegramId}`,
          { next: { revalidate: 30 } }
        ),
      ])

    const [requestsData, pointsData, allPointsData] =
      await Promise.all([
        requestsRes.json(),
        pointsRes.json(),
        allPointsRes.json(),
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
    if (!allPointsRes.ok)
      return NextResponse.json(
        {
          error:
            allPointsData.error ||
            'Failed to fetch all points',
        },
        { status: 500 }
      )

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
      allPoints: allPointsData.points || [],
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
