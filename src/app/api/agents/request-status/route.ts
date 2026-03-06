import { NextRequest, NextResponse } from 'next/server';
import { validateAgentToken } from '@/lib/agents/auth';
import { requestStatusQuerySchema } from '@/lib/agents/schema';
import { AgentsService } from '@/services/agents.service';

export async function GET(req: NextRequest) {
  if (!validateAgentToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const parsed = requestStatusQuerySchema.safeParse({ id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  try {
    const status = await AgentsService.getRequestStatus(parsed.data.id);

    if (!status) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
