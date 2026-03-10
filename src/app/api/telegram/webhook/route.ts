import { NextResponse } from 'next/server';
import { bot } from '@/lib/bot';

export async function POST(req: Request) {
  try {
    const update = await req.json();

    if (update) {
      try {
        if (!bot.isInited()) {
          await bot.init();
        }
        await bot.handleUpdate(update);
      } catch (e) {
        console.error('Error in bot.handleUpdate:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
