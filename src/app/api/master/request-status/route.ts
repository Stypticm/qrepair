import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'

export async function PATCH(req: NextRequest) {
  try {
    const { requestId, status, telegramId } =
      await req.json()

    if (!requestId || !status || !telegramId) {
      return NextResponse.json(
        {
          error:
            'Request ID, status and telegram ID are required',
        },
        { status: 400 }
      )
    }

    // Проверяем, является ли пользователь мастером
    const master = await prisma.master.findUnique({
      where: { telegramId: telegramId },
    })

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      )
    }

    // Проверяем, что заявка назначена этому мастеру
    const request = await prisma.skupka.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    if (request.assignedMasterId !== master.id) {
      return NextResponse.json(
        { error: 'You are not assigned to this request' },
        { status: 403 }
      )
    }

    // Обновляем статус заявки
    const updatedRequest = await prisma.skupka.update({
      where: { id: requestId },
      data: { status: status as any },
    })

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    })
  } catch (error) {
    console.error('Error updating request status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
