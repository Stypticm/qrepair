import { NextRequest, NextResponse } from 'next/server';
import { validateAgentToken } from '@/lib/agents/auth';
import { escalationSchema } from '@/lib/agents/schema';
import { AgentsService } from '@/services/agents.service';

export async function POST(req: NextRequest) {
  if (!validateAgentToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = escalationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const result = await AgentsService.escalate(parsed.data);

    // Логируем вызов
    await AgentsService.logAudit({
      agentName: parsed.data.agentName,
      action: 'ESCALATION',
      input: parsed.data,
      output: result,
      status: 'success',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
