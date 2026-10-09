import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage';
import { ADMIN_TELEGRAM_IDS } from '@/core/lib/admin';

export async function notifyAllAdmins(payload: { title: string; body: string; url?: string }) {
    try {
        // Собираем все admin chat ID из .env (ADMIN_CHAT_ID, TELEGRAM_CHAT_ID_misha, TELEGRAM_CHAT_ID_roma и др.)
        const dynamicEnvIds: string[] = [];
        for (const [key, value] of Object.entries(process.env)) {
            if (value && /^(ADMIN_CHAT_ID|TELEGRAM_CHAT_ID|ADMIN_TELEGRAM_ID)/i.test(key)) {
                value.split(',').forEach((val) => {
                    const trimmed = val.trim();
                    if (trimmed) dynamicEnvIds.push(trimmed);
                });
            }
        }

        const targetChatIds = Array.from(new Set([
            ...dynamicEnvIds,
            ...ADMIN_TELEGRAM_IDS,
        ].filter(Boolean) as string[]));

        console.log(`[Admin Telegram Notify] Sending notification to ${targetChatIds.length} admins:`, targetChatIds);

        if (targetChatIds.length === 0) {
            console.log('[Admin Telegram Notify] No admin chat IDs found in env');
            return;
        }

        const messageText = `🔔 <b>${payload.title}</b>\n\n${payload.body}`;

        const results = await Promise.allSettled(
            targetChatIds.map(async (chatId) => {
                try {
                    return await sendTelegramMessage(chatId, messageText, { parse_mode: 'HTML' });
                } catch (htmlErr) {
                    // Fallback to plain text if HTML formatting fails
                    try {
                        return await sendTelegramMessage(chatId, `${payload.title}\n\n${payload.body}`);
                    } catch (plainErr) {
                        console.error(`[Admin Telegram Notify] Error sending to ${chatId}:`, plainErr);
                        throw plainErr;
                    }
                }
            })
        );

        const successful = results.filter((r) => r.status === 'fulfilled').length;
        console.log(`[Admin Telegram Notify] Successfully sent to ${successful}/${targetChatIds.length} admins`);
    } catch (error) {
        console.error('Error in notifyAllAdmins:', error);
    }
}
