import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Авто-освобождение зарезервированных товаров старше 24 часов
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    await prisma.marketplaceLot.updateMany({
      where: {
        status: 'reserved',
        updatedAt: {
          lt: twentyFourHoursAgo
        }
      },
      data: {
        status: 'available'
      }
    })

    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20', 10),
      50
    )
    const offset = Math.max(
      parseInt(searchParams.get('offset') || '0', 10),
      0
    )

    // Получаем лоты из таблицы MarketplaceLot
    const items = await prisma.marketplaceLot.findMany({
      where: {
        status: 'available', // Только доступные лоты
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    const feed = items.map((item) => {
      return {
        id: item.id,
        title: item.title,
        price: item.price,
        date: item.createdAt.toISOString(),
        cover: item.coverPhoto,
        photos: item.photos || [],
        model: item.model,
        storage: item.storage,
        color: item.color,
        condition: item.condition || 'Отличное',
        description: item.description,
      }
    })

    return NextResponse.json({ items: feed, limit, offset })
  } catch (error) {
    console.error('Error fetching market feed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
