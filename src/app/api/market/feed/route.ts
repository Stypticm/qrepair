import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20', 10),
      50
    )
    const offset = Math.max(
      parseInt(searchParams.get('offset') || '0', 10),
      0
    )

    const items = await prisma.skupka.findMany({
      where: {
        status: 'paid',
        photoUrls: { isEmpty: false as any },
      },
      // Сортируем по дате создания, так как paidAt отсутствует в схеме
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        modelname: true,
        finalPrice: true,
        price: true,
        createdAt: true,
        photoUrls: true,
      },
      take: limit,
      skip: offset,
    })

    const feed = items.map((x) => ({
      id: x.id,
      title: x.modelname,
      price: x.finalPrice ?? x.price ?? null,
      // Используем createdAt как дату карточки
      date: x.createdAt,
      cover:
        Array.isArray(x.photoUrls) && x.photoUrls.length > 0
          ? x.photoUrls[0]
          : null,
    }))

    return NextResponse.json({ items: feed, limit, offset })
  } catch (error) {
    console.error('Error fetching market feed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
