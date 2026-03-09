import { NextRequest, NextResponse } from 'next/server';
import { chatProxyRequestSchema } from '@/lib/agents/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = chatProxyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { userId, text, requestId } = parsed.data;

    const webhookUrl = process.env.N8N_SITE_CHAT_WEBHOOK_URL;
    const internalToken = process.env.INTERNAL_API_TOKEN;

    if (!webhookUrl) {
      console.error('[SiteChatProxy] Missing N8N_SITE_CHAT_WEBHOOK_URL');
      return NextResponse.json(
        { ok: false, reply: "Фоновый сервис не настроен.", error: "N8N_UNAVAILABLE" },
        { status: 503 }
      );
    }

    const payload = {
      userId,
      text,
      requestId,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (internalToken) {
      headers['X-Internal-Token'] = internalToken;
    }

    const startTime = Date.now();
    let attempt = 0;
    const maxAttempts = 2; // 1 initial + 1 retry

    while (attempt < maxAttempts) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const latency = Date.now() - startTime;
        console.log(`[SiteChatProxy] Attempt ${attempt}: POST ${webhookUrl} - status: ${response.status} - latency: ${latency}ms - requestId: ${requestId || 'none'}`);

        if (!response.ok) {
          if (attempt < maxAttempts) {
            console.warn(`[SiteChatProxy] Non-OK response. Retrying (attempt ${attempt + 1})...`);
            continue;
          }
          let errorText = await response.text().catch(() => 'Unknown error text');
          console.error(`[SiteChatProxy] Failed to fetch webhook: ${response.status} ${response.statusText}`, errorText);
          throw new Error('Non-OK response from n8n');
        }

        const data = await response.json();
        const route = data.route || 'unknown';
        console.log(`[SiteChatProxy] Success - route: ${route} - requestId: ${data.requestId || requestId || 'none'}`);

        return NextResponse.json({
          ok: true,
          reply: data.reply || '',
          route: data.route,
          requestId: data.requestId || requestId,
        });
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.warn(`[SiteChatProxy] Timeout after 12s on attempt ${attempt}`);
        } else {
          console.error(`[SiteChatProxy] Fetch error on attempt ${attempt}:`, error);
        }

        if (attempt < maxAttempts) {
          console.log(`[SiteChatProxy] Retrying (attempt ${attempt + 1})...`);
        } else {
          return NextResponse.json({
            ok: false,
            reply: "Сервис временно недоступен, попробуйте через минуту.",
            error: "N8N_UNAVAILABLE"
          });
        }
      }
    }
  } catch (err: any) {
    console.error('[SiteChatProxy] Internal error:', err);
    return NextResponse.json(
      { ok: false, reply: "Внутренняя ошибка сервера.", error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
