import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/services/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20', 10),
      500
    )
    const offset = Math.max(
      parseInt(searchParams.get('offset') || '0', 10),
      0
    )

    // Получаем лоты через Go API
    // Примечание: Если API не поддерживает фильтрацию, фильтруем на стороне Next.js
    const items = await api.list<any>('marketplace-lots', { limit: 100, offset: 0 });

    const feed = items
      .filter((item: any) => item.status === 'available') // Только доступные лоты
      .slice(offset, offset + limit)
      .map((item: any) => {
        return {
          id: item.id,
          title: item.title,
          price: item.price,
          date: item.createdAt,
          cover: item.coverPhoto,
          photos: item.photos || [],
          model: item.model,
          storage: item.storage,
          color: item.color,
          condition: item.condition || 'Отличное',
          description: item.description,
          oldPrice: item.oldPrice,
          isAccessory: item.isAccessory,
          targetBrand: item.targetBrand,
          targetModel: item.targetModel,
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
