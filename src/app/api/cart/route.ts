import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    let telegramId = request.headers.get('x-telegram-id')
    
    // Fallback для браузера (тестирование)
    if (!telegramId) {
      telegramId = 'browser_test_user'
    }

    // Получаем корзину пользователя из БД
    const cartItems = await prisma.cartItem.findMany({
      where: { telegramId: telegramId },
      include: { 
        lot: true // включаем данные лота
      },
      orderBy: { addedAt: 'desc' }
    })

    // Форматируем ответ для совместимости с useCart
    const formattedItems = cartItems.map(item => ({
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
      quantity: item.quantity
    }))

    return NextResponse.json({
      success: true,
      cartItems: formattedItems,
    })
  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { lotId, action, quantity } = await request.json()

    if (!action) {
      return NextResponse.json(
        { error: 'Действие обязательно' },
        { status: 400 }
      )
    }

    let telegramId = request.headers.get('x-telegram-id')
    
    // Fallback для браузера (тестирование)
    if (!telegramId) {
      telegramId = 'browser_test_user'
    }

    // Добавление в корзину
    if (action === 'add') {
      if (!lotId) {
        return NextResponse.json(
          { error: 'ID лота обязателен' },
          { status: 400 }
        )
      }

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

      // Используем upsert для добавления или обновления количества
      const cartItem = await prisma.cartItem.upsert({
        where: {
          telegramId_lotId: {
            telegramId: telegramId,
            lotId: lotId
          }
        },
        update: {
          quantity: {
            increment: quantity || 1
          },
          updatedAt: new Date()
        },
        create: {
          telegramId: telegramId,
          lotId: lotId,
          quantity: quantity || 1
        },
        include: { lot: true }
      })

      return NextResponse.json({
        success: true,
        message: 'Добавлено в корзину',
        item: cartItem,
      })
    }

    // Удаление из корзины
    if (action === 'remove') {
      if (!lotId) {
        return NextResponse.json(
          { error: 'ID лота обязателен' },
          { status: 400 }
        )
      }

      await prisma.cartItem.delete({
        where: {
          telegramId_lotId: {
            telegramId: telegramId,
            lotId: lotId
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Удалено из корзины',
      })
    }

    // Обновление количества
    if (action === 'updateQuantity') {
      if (!lotId || !quantity) {
        return NextResponse.json(
          { error: 'ID лота и количество обязательны' },
          { status: 400 }
        )
      }

      if (quantity <= 0) {
        // Если количество 0 или меньше, удаляем из корзины
        await prisma.cartItem.delete({
          where: {
            telegramId_lotId: {
              telegramId: telegramId,
              lotId: lotId
            }
          }
        })
      } else {
        await prisma.cartItem.update({
          where: {
            telegramId_lotId: {
              telegramId: telegramId,
              lotId: lotId
            }
          },
          data: {
            quantity: quantity,
            updatedAt: new Date()
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Количество обновлено',
      })
    }

    // Очистка корзины
    if (action === 'clear') {
      await prisma.cartItem.deleteMany({
        where: { telegramId: telegramId }
      })

      return NextResponse.json({
        success: true,
        message: 'Корзина очищена',
      })
    }

    return NextResponse.json(
      { error: 'Неизвестное действие' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Cart error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
