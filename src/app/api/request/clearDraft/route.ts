import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(request: NextRequest) {
  try {
    const { telegramId } = await request.json()

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      )
    }

    // Удаляем все записи для данного пользователя
    const deletedRequests = await prisma.skupka.deleteMany({
      where: {
        telegramId: telegramId.toString(),
      },
    })

    console.log(
      `Deleted ${deletedRequests.count} requests for telegramId: ${telegramId}`
    )

    return NextResponse.json({
      success: true,
      deletedCount: deletedRequests.count,
    })
  } catch (error) {
    console.error('Error clearing draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
