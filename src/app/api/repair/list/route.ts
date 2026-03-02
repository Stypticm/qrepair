import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { checkAdminAccessFromDB } from '@/core/lib/admin-server'

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-id')

    if (!telegramId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем права: ADMIN/MANAGER видят все, MASTER видит назначенные на него
    // Это API для админки
    const { hasAccess, role } = await checkAdminAccessFromDB(telegramId)
    
    if (!hasAccess && role !== 'MASTER' && role !== 'COURIER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    
    // Формируем фильтр
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    // Курьер видит только в транзите или ожидающие доставки
    if (role === 'COURIER') {
      where.status = {
        in: ['courier_assigned', 'in_transit', 'ready_for_pickup']
      }
    }

    const requests = await prisma.repairRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            telegramId: true,
          }
        },
        assignedMaster: {
          select: {
            name: true,
            username: true,
          }
        }
      }
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching repair requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}
