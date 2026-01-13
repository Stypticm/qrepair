import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, status, masterTelegramId } = body

    if (!requestId || !status || !masterTelegramId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Проверяем, что мастер существует
    const master = await prisma.master.findUnique({
      where: { telegramId: masterTelegramId },
    })

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      )
    }

    // Проверяем, что заявка существует и назначена этому мастеру
    const existingRequest = await prisma.skupka.findUnique({
      where: { id: requestId },
      include: { assignedMaster: true },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    if (existingRequest.assignedMasterId !== master.id) {
      return NextResponse.json(
        {
          error:
            'Access denied - request not assigned to this master',
        },
        { status: 403 }
      )
    }

    // Обновляем статус заявки
    const updatedRequest = await prisma.skupka.update({
      where: { id: requestId },
      data: {
        status: status as any, // Prisma автоматически приведет к правильному типу
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      request: updatedRequest,
    })
  } catch (error) {
    console.error('Error updating request status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
