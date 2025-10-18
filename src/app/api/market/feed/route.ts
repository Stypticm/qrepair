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

    // Получаем лоты из таблицы Skupka через Prisma
    const items = await prisma.skupka.findMany({
      where: {
        status: 'paid', // Только оплаченные заявки
        NOT: {
          photoUrls: {
            isEmpty: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    const feed = items.map((item) => {
      // Разбираем modelname на компоненты: "iPhone 15 Pro 256GB Красный"
      const modelParts = (item.modelname || '').split(' ')
      let model = ''
      let storage = ''
      let color = ''

      if (modelParts.length >= 3) {
        // Ищем GB в строке для определения storage
        const gbIndex = modelParts.findIndex((part) =>
          part.includes('GB')
        )
        if (gbIndex > 0) {
          model = modelParts.slice(0, gbIndex).join(' ')
          storage = modelParts[gbIndex]
          color = modelParts.slice(gbIndex + 1).join(' ')
        } else {
          // Fallback: берем первые 2 части как модель, остальное как цвет
          model = modelParts.slice(0, 2).join(' ')
          color = modelParts.slice(2).join(' ')
        }
      } else {
        model = item.modelname || 'Устройство'
      }

      return {
        id: item.id,
        title: item.modelname || 'Устройство',
        price: item.price,
        date: item.createdAt.toISOString(),
        cover:
          Array.isArray(item.photoUrls) &&
          item.photoUrls.length > 0
            ? item.photoUrls[0]
            : null,
        // Все фото для галереи
        photos: Array.isArray(item.photoUrls)
          ? item.photoUrls
          : [],
        // Разбитые поля для плиток
        model: model,
        storage: storage,
        color: color,
        condition: item.userEvaluation || 'Отличное', // Получаем из БД
        description: item.comment,
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
