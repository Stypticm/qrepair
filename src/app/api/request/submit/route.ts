import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { telegramId, modelname, answers } =
      await request.json()

    if (!telegramId || !modelname) {
      return NextResponse.json(
        { error: 'Telegram ID and modelname required' },
        { status: 400 }
      )
    }

    // Ищем существующую заявку по telegramId
    const existingRequest = await prisma.skupka.findFirst({
      where: { telegramId },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Обновляем заявку как завершенную
    const updatedRequest = await prisma.skupka.update({
      where: { id: existingRequest.id },
      data: {
        modelname,
        answers: answers || [],
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      requestId: updatedRequest.id,
      message: 'Заявка успешно отправлена',
    })
  } catch (error) {
    console.error('Error submitting request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
