import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { checkAdminAccessFromDB } from '@/core/lib/admin-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const telegramId = request.headers.get('x-telegram-id')

    if (!telegramId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestData = await prisma.repairRequest.findUnique({
      where: { id: params.id },
      include: {
        assignedMaster: {
          select: { name: true }
        }
      }
    })

    if (!requestData) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Проверяем доступ: либо владелец заявки, либо сотрудник
    const { hasAccess } = await checkAdminAccessFromDB(telegramId)
    
    if (requestData.telegramId !== telegramId && !hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ request: requestData })
  } catch (error) {
    console.error('Error fetching repair request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const telegramId = request.headers.get('x-telegram-id')
    if (!telegramId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Только сотрудники могут менять статус
    const { hasAccess } = await checkAdminAccessFromDB(telegramId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updates = await request.json()
    
    // Запрещаем менять некоторые поля напрямую
    delete updates.id
    delete updates.telegramId
    delete updates.createdAt

    const result = await prisma.repairRequest.update({
      where: { id: params.id },
      data: updates
    })

    return NextResponse.json({ success: true, request: result })
  } catch (error) {
    console.error('Error updating repair request:', error)
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    )
  }
}
