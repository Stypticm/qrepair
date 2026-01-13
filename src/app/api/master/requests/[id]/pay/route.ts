import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params
    if (!requestId) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { masterTelegramId } = body || {}

    const updated = await prisma.skupka.update({
      where: { id: requestId },
      data: {
        status: 'paid',
        ...(masterTelegramId
          ? { assignedMasterId: masterTelegramId }
          : {}),
      },
    })

    return NextResponse.json({
      success: true,
      request: updated,
    })
  } catch (error: any) {
    console.error('Error marking paid:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to mark as paid' },
      { status: 500 }
    )
  }
}
