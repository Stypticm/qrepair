import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { inspectionId, testsResults } = body

    if (!inspectionId || !testsResults) {
      return NextResponse.json(
        { error: 'Missing inspectionId or testsResults' },
        { status: 400 }
      )
    }

    // Обновляем результаты тестов
    const updatedInspection =
      await prisma.deviceInspection.update({
        where: { id: inspectionId },
        data: {
          testsResults,
        },
      })

    return NextResponse.json({
      success: true,
      inspection: updatedInspection,
    })
  } catch (error) {
    console.error('Error updating inspection:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
