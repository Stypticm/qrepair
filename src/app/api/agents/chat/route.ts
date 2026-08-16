import { NextRequest, NextResponse } from 'next/server';
import { chatProxyRequestSchema } from '@/lib/agents/schema';
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = chatProxyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { userId, messages, requestId } = parsed.data;
    const lastMessage = messages?.[messages.length - 1]?.content || "";
    const agentUrl = process.env.AGENT_URL || "http://localhost:8001";

    let reply = "";
    let shouldEscalate = false;

    const managerKeywords = [
      'менеджер', 'менеджером', 'менеджеру', 'к менеджеру',
      'человек', 'человеком', 'человеку', 'живой оператор',
      'живого оператора', 'оператору', 'соедините с оператором',
      'соедините с менеджером', 'живой менеджер', 'живого менеджера',
      'реальный менеджер', 'реальный оператор', 'не робот',
      'не бот', 'по-живому', 'по живому', 'настоящий сотрудник',
      'сотрудник', 'администратор', 'админу', 'админа',
      'ручной режим', 'подключите человека', 'позовите человека',
      'позовите оператора', 'позовите менеджера'
    ];
    const lowerLastMessage = lastMessage.toLowerCase();
    const hasManagerRequest = managerKeywords.some(k => lowerLastMessage.includes(k));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(`${agentUrl}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_query: lastMessage }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) throw new Error("Python backend returned " + response.status);
      const data = await response.json();
      reply = data.answer || data.response || "Пустой ответ от ИИ";

      const lowerReply = reply.toLowerCase();

      // Паттерны эскалации — расширенный список
      const hasEscalateTag = /<ESCALATE_REASON>|<ESCALATE_REASON\s*:/i.test(reply);
      const noInfoPatterns = [
        'нет данных', 'нет информации', 'не найдено', 'не найден',
        'не знаю', 'не могу ответить', 'не могу помочь',
        'в нашей базе', 'в базе нет', 'базов знаний нет',
        'уточните у оператора', 'пожалуйста, уточните',
        'оператор поможет', 'подключим оператора',
        'escalate', 'оператор', 'в моей базе знаний нет информации',
        'недоступен', 'не удалось', 'техническая ошибка', 'временн',
        'попробуйте позже', 'попробуйте ещё раз', 'не удалось обработать',
        'не могу обработать', 'не понял', 'не поняла', 'не понятно',
        'нет ответа', 'без ответа', 'не знаю что ответить',
        'невозможно ответить', 'не могу дать ответ'
      ];
      const hasNoInfo = noInfoPatterns.some(p => lowerReply.includes(p));
      const looksLikeGenericError = reply.trim().length < 20 && /не знаю|не могу|нет ответ|не понял|не удалось|не могу|недоступен/i.test(reply);
      shouldEscalate = hasEscalateTag || hasNoInfo || hasManagerRequest || looksLikeGenericError;

      if (hasManagerRequest && !hasEscalateTag && !hasNoInfo) {
        reply = "Я передал ваш запрос менеджеру. Он свяжется с вами в ближайшее время!";
      }

      // Очищаем служебные теги из ответа
      reply = reply
        .replace(/<ESCALATE_REASON>.*?<\/ESCALATE_REASON>\s*/i, '')
        .replace(/ESCALATE_REASON\s*:[^\n]*\n?/i, '')
        .trim();
    } catch (e) {
      clearTimeout(timeout);
      console.error("Valera Brain is unreachable:", e);
      reply = "Мой ИИ-помощник временно недоступен. Сейчас позову живого оператора!";
      shouldEscalate = true;
    }

    // Логика эскалации — отправляем в Telegram
    if (shouldEscalate) {
      const adminChatId = process.env.TELEGRAM_CHAT_ID_misha;
      if (adminChatId) {
        try {
          // userId используется как guestId для обратной связи через бота
          await sendTelegramMessage(
            adminChatId,
            `🚨 Новый вопрос в чате от пользователя ${userId}\n\n${lastMessage}\n\n💬 Ответьте на это сообщение чтобы клиент увидел ваш ответ`
          );
        } catch (e) {
          console.error('[SiteChatProxy] Telegram notify failed:', e);
        }
      }

      return NextResponse.json({
        ok: true,
        reply: "Я передал ваш вопрос оператору. Он подключится к чату в ближайшее время!",
        route: 'escalate',
        requestId: requestId,
      });
    }

    // Отправляем умный ответ клиенту
    return NextResponse.json({
      ok: true,
      reply: reply,
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
