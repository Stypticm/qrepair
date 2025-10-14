import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type PriceRangePayload = {
  min: number
  max: number
  midpoint: number
}

export async function POST(req: NextRequest) {
  try {
    const {
      telegramId,
      userEvaluation,
      damagePercent,
      price,
      priceRange,
    } = await req.json()

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      )
    }

    const draft = await prisma.skupka.findFirst({
      where: {
        telegramId: String(telegramId),
        status: 'draft',
      },
    })

    const pricingPayload =
      priceRange || price !== undefined
        ? {
            ...(priceRange as PriceRangePayload | undefined),
            midpoint:
              priceRange?.midpoint ??
              (typeof price === 'number' ? price : null),
            updatedAt: new Date().toISOString(),
          }
        : undefined

    if (draft) {
      const baseDeviceData =
        draft.deviceData && typeof draft.deviceData === 'object'
          ? { ...(draft.deviceData as Record<string, unknown>) }
          : {}

      const existingPricing =
        baseDeviceData &&
        typeof (baseDeviceData as { pricing?: unknown }).pricing === 'object'
          ? {
              ...(
                (baseDeviceData as { pricing?: Record<string, unknown> })
                  .pricing as Record<string, unknown>
              ),
            }
          : {}

      const updatedDeviceData =
        pricingPayload !== undefined
          ? {
              ...baseDeviceData,
              pricing: {
                ...existingPricing,
                ...pricingPayload,
              },
            }
          : baseDeviceData

      await prisma.skupka.update({
        where: { id: draft.id },
        data: {
          userEvaluation,
          damagePercent,
          currentStep: 'submit',
          ...(typeof price === 'number' ? { price } : {}),
          ...(pricingPayload !== undefined
            ? { deviceData: updatedDeviceData }
            : {}),
        },
      })
    } else {
      await prisma.skupka.create({
        data: {
          telegramId: String(telegramId),
          username: 'Unknown',
          userEvaluation,
          damagePercent,
          status: 'draft',
          currentStep: 'submit',
          ...(typeof price === 'number' ? { price } : {}),
          ...(pricingPayload !== undefined
            ? { deviceData: { pricing: pricingPayload } }
            : {}),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving evaluation:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
