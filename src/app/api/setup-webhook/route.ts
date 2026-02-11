import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const BOT_TOKEN = process.env.BOT_TOKEN;
        const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://qrepair.vercel.app'; // Fallback to assumed prod URL if env missing

        if (!BOT_TOKEN) {
            return NextResponse.json({ error: 'Missing BOT_TOKEN' }, { status: 500 });
        }

        const webhookUrl = `${BASE_URL}/api/telegram/webhook`;
        console.log('Webhook URL:', webhookUrl);
        
        // Construct the Telegram API URL
        // Note: drop_pending_updates=true ensures we don't get flooded with old messages if any
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}&drop_pending_updates=true&allowed_updates=["message","callback_query"]`;

        const res = await fetch(telegramUrl);
        const data = await res.json();

        return NextResponse.json({
            message: 'Webhook setup attempt finished',
            target_url: webhookUrl,
            telegram_response: data
        });
    } catch (error: any) {
        return NextResponse.json({ 
            error: 'Failed to set webhook', 
            details: error.message 
        }, { status: 500 });
    }
}
