import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-id')

    if (!telegramId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Базовая валидация
    if (!data.deviceModel || !data.category || !data.deliveryMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Создаем заявку на ремонт
    const repairRequest = await prisma.repairRequest.create({
      data: {
        telegramId,
        deviceModel: data.deviceModel,
        serialNumber: data.serialNumber || null,
        category: data.category,
        issueDescription: data.issueDescription || null,
        issuePhotos: data.issuePhotos || [],
        estimatedMin: data.estimatedMin || null,
        estimatedMax: data.estimatedMax || null,
        deliveryMethod: data.deliveryMethod,
        appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : null,
        appointmentTime: data.appointmentTime || null,
        status: 'created',
      }
    })

    return NextResponse.json({ success: true, id: repairRequest.id })
  } catch (error) {
    console.error('Error creating repair request:', error)
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    )
  }
}
