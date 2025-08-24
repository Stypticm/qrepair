import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

// Обновление мастера (активация/деактивация)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { isActive } = body

    const master = await prisma.master.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json({
      success: true,
      master,
    })
  } catch (error) {
    console.error('Error updating master:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

// Удаление мастера
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Проверяем, есть ли связанные проверки
    const relatedInspections =
      await prisma.deviceInspection.findMany({
        where: {
          master: {
            id: id,
          },
        },
      })

    if (relatedInspections.length > 0) {
      // Если есть связанные проверки, обновляем их, убирая связь с мастером
      await prisma.deviceInspection.updateMany({
        where: {
          master: {
            id: id,
          },
        },
        data: {
          masterUsername: '',
        },
      })
    }

    await prisma.master.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error deleting master:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
