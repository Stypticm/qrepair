import { NextRequest, NextResponse } from 'next/server';
import { chatProxyRequestSchema } from '@/lib/agents/schema';
import { askAI } from '@/lib/agents/ollamaService';
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = chatProxyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { userId, messages, requestId } = parsed.data;

    // Системный промпт — это то, как ИИ себя воспринимает
    const systemPrompt = `Ты дружелюбный ассистент сервиса Qoqos (выкуп и ремонт техники). 
Отвечай кратко, вежливо и по-русски. 
Если ты не знаешь ответ, сомневаешься, или клиент хочет поговорить с живым человеком, напиши ровно одно слово: [ESCALATE]`;

    // Вызываем нашу локальную Ollama!
    const result = await askAI({
      messages: messages || [],
      systemPrompt: systemPrompt
    });

    // Обрабатываем результат
    if (result.shouldEscalate) {
      // TODO (Этап 3): Здесь мы добавим отправку сообщения тебе в Telegram
      // Ищем твой ID админа в .env
      const adminId = process.env.ADMIN_CHAT_ID || "ТВОЙ_ТЕЛЕГРАМ_ID_ЕСЛИ_НЕТ_В_ENV";

      await sendTelegramMessage(adminId, `🚨 Новый вопрос в чате от пользователя ${userId}\n\n${messages[messages.length - 1]?.content}`);

      return NextResponse.json({
        ok: true,
        reply: "Я передал ваш вопрос оператору. Он подключится к чату с минуты на минуту!",
        route: 'escalate',
        requestId: requestId,
      });
    }

    // Обычный ответ от ИИ
    return NextResponse.json({
      ok: true,
      reply: result.reply,
      route: 'chat',
      requestId: requestId,
    });

  } catch (err: any) {
    console.error('[SiteChatProxy] Internal error:', err);
    return NextResponse.json(
      { ok: false, reply: "Простите, я немного задумался. Повторите вопрос?", error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
