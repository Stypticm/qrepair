import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-id')

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    // Получаем избранное пользователя из БД
    const favoriteItems = await prisma.favoriteItem.findMany({
      where: { telegramId: telegramId },
      include: { 
        lot: true // включаем данные лота
      },
      orderBy: { addedAt: 'desc' }
    })

    // Форматируем ответ
    const formattedItems = favoriteItems.map(item => ({
      id: item.lot.id,
      title: item.lot.title,
      price: item.lot.price,
      cover: item.lot.coverPhoto,
      photos: item.lot.photos,
      date: item.lot.createdAt.toISOString(),
      model: item.lot.model,
      storage: item.lot.storage,
      color: item.lot.color,
      condition: item.lot.condition,
      description: item.lot.description,
      addedAt: item.addedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      favorites: formattedItems,
    })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { lotId, action } = await request.json()

    if (!lotId || !action) {
      return NextResponse.json(
        { error: 'ID лота и действие обязательны' },
        { status: 400 }
      )
    }

    const telegramId = request.headers.get('x-telegram-id')

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    // Добавление в избранное
    if (action === 'add') {
      // Проверяем существование лота
      const lotExists = await prisma.marketplaceLot.findUnique({
        where: { id: lotId }
      })

      if (!lotExists) {
        return NextResponse.json(
          { error: 'Лот не найден' },
          { status: 404 }
        )
      }

      // Проверяем, нет ли уже в избранном
      const existing = await prisma.favoriteItem.findUnique({
        where: {
          telegramId_lotId: {
            telegramId: telegramId,
            lotId: lotId
          }
        }
      })

      if (existing) {
        return NextResponse.json({
          success: true,
          message: 'Уже в избранном',
        })
      }

      // Добавляем в избранное
      const favoriteItem = await prisma.favoriteItem.create({
        data: {
          telegramId: telegramId,
          lotId: lotId
        },
        include: { lot: true }
      })

      return NextResponse.json({
        success: true,
        message: 'Добавлено в избранное',
        item: favoriteItem,
      })
    }

    // Удаление из избранного
    if (action === 'remove') {
      await prisma.favoriteItem.delete({
        where: {
          telegramId_lotId: {
            telegramId: telegramId,
            lotId: lotId
          }
        }
      }).catch(() => {
        // Игнорируем ошибку, если элемента нет
      })

      return NextResponse.json({
        success: true,
        message: 'Удалено из избранного',
      })
    }

    // Переключение (toggle)
    if (action === 'toggle') {
      const existing = await prisma.favoriteItem.findUnique({
        where: {
          telegramId_lotId: {
            telegramId: telegramId,
            lotId: lotId
          }
        }
      })

      if (existing) {
        // Удаляем
        await prisma.favoriteItem.delete({
          where: {
            telegramId_lotId: {
              telegramId: telegramId,
              lotId: lotId
            }
          }
        })

        return NextResponse.json({
          success: true,
          isFavorite: false,
          message: 'Удалено из избранного',
        })
      } else {
        // Добавляем
        await prisma.favoriteItem.create({
          data: {
            telegramId: telegramId,
            lotId: lotId
          }
        })

        return NextResponse.json({
          success: true,
          isFavorite: true,
          message: 'Добавлено в избранное',
        })
      }
    }

    return NextResponse.json(
      { error: 'Неизвестное действие' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Favorites error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
