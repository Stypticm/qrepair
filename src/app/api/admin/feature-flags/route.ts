import { NextRequest, NextResponse } from 'next/server'
import {
  FEATURE_FLAGS,
  type FeatureFlag,
} from '@/lib/featureFlags'

// Получить все флаги
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      flags: FEATURE_FLAGS,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    )
  }
}

// Обновить флаг
export async function POST(request: NextRequest) {
  try {
    const { feature, telegramId, enabled } =
      await request.json()

    if (
      !feature ||
      !telegramId ||
      typeof enabled !== 'boolean'
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: feature, telegramId, enabled',
        },
        { status: 400 }
      )
    }

    // В реальном приложении здесь была бы работа с БД
    // Пока что просто возвращаем успех
    return NextResponse.json({
      success: true,
      message: `Feature ${feature} ${
        enabled ? 'enabled' : 'disabled'
      } for user ${telegramId}`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update feature flag' },
      { status: 500 }
    )
  }
}
