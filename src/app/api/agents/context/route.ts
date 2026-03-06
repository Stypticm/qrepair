import { NextRequest, NextResponse } from 'next/server';
import { validateAgentToken } from '@/lib/agents/auth';
import { agentContextQuerySchema } from '@/lib/agents/schema';
import { AgentsService } from '@/services/agents.service';

export async function GET(req: NextRequest) {
  if (!validateAgentToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get('telegramId');

  const parsed = agentContextQuerySchema.safeParse({ telegramId });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  try {
    const context = await AgentsService.getContext(parsed.data.telegramId);

    if (!context) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ context });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
