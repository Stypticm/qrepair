import { NextRequest, NextResponse } from 'next/server';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { requireAuth } from '@/core/lib/requireAuth';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    return NextResponse.json({ success: true, flags: FEATURE_FLAGS })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feature flags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { feature, telegramId, enabled } = await request.json()

    if (!feature || !telegramId || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields: feature, telegramId, enabled' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Feature ${feature} ${enabled ? 'enabled' : 'disabled'} for user ${telegramId}`,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update feature flag' }, { status: 500 })
  }
}
