import { NextRequest, NextResponse } from 'next/server';
import { validateAgentToken } from '@/lib/agents/auth';
import { updateRequestStatusSchema } from '@/lib/agents/schema';
import { AgentsService } from '@/services/agents.service';

export async function POST(req: NextRequest) {
  if (!validateAgentToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idempotencyKey = req.headers.get('idempotency-key');
  if (!idempotencyKey) {
    return NextResponse.json({ error: 'Idempotency-Key header is required' }, { status: 400 });
  }

  try {
    // 1. Проверяем идемпотентность
    const isDuplicate = await AgentsService.checkIdempotency(idempotencyKey);
    if (isDuplicate) {
      return NextResponse.json({ message: 'Request already processed' }, { status: 200 });
    }

    // 2. Парсим и валидируем тело
    const body = await req.json();
    const parsed = updateRequestStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { id, status, agentName, comment } = parsed.data;

    // 3. Обновляем статус
    const result = await AgentsService.updateRequestStatus(id, status);

    // 4. Логируем успешный аудит
    await AgentsService.logAudit({
      requestId: id,
      agentName: agentName,
      action: 'UPDATE_STATUS',
      input: parsed.data,
      output: { result, idempotencyKey },
      status: 'success',
    });

    return NextResponse.json({ success: true, updated: result });
  } catch (error: any) {
    // 5. Логируем ошибку, если удалось спарсить payload
    try {
      const clonedReq = req.clone();
      const body = await clonedReq.json();
      await AgentsService.logAudit({
        agentName: body?.agentName || 'unknown',
        requestId: body?.id,
        action: 'UPDATE_STATUS',
        input: body,
        output: { error: error.message },
        status: 'error',
      });
    } catch {} // игнорируем ошибки логирования в блоке catch

    return NextResponse.json({ error: Object.assign({}, error, { message: error.message }) }, { status: 500 });
  }
}
