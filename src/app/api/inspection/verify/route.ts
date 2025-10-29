import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { skupkaId, masterUsername, inspectionToken } =
      body

    if (!skupkaId || !masterUsername || !inspectionToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Проверяем токен и его срок действия
    const inspection =
      await prisma.deviceInspection.findFirst({
        where: {
          skupkaId,
          masterUsername,
          inspectionToken,
          tokenExpiresAt: {
            gt: new Date(),
          },
        },
        include: {
          skupka: true,
        },
      })

    if (!inspection) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Проверяем, что мастер назначен к этой заявке
    // Ищем мастера в таблице Master
    const master = await prisma.master.findUnique({
      where: { username: masterUsername },
    })

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      )
    }

    // Проверяем, что мастер назначен к этой заявке (из JSON courier)
    const assignedTelegramId = (
      (inspection.skupka as any).courier || {}
    ).telegramId
    if (assignedTelegramId !== master.telegramId) {
      return NextResponse.json(
        { error: 'Master not assigned to this request' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      inspection: {
        id: inspection.id,
        skupkaId: inspection.skupkaId,
        masterUsername: inspection.masterUsername,
        testsResults: inspection.testsResults,
        finalPrice: inspection.finalPrice,
        inspectionNotes: inspection.inspectionNotes,
        completedAt: inspection.completedAt,
        createdAt: inspection.createdAt,
      },
      skupka: {
        id: inspection.skupka.id,
        modelname: inspection.skupka.modelname,
        price: inspection.skupka.price,
        status: inspection.skupka.status,
      },
    })
  } catch (error) {
    console.error('Error verifying inspection:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
