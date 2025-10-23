import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const invoiceData = await req.json()

    // Валидация данных
    if (
      !invoiceData.title ||
      !invoiceData.amount ||
      !invoiceData.currency
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Здесь должна быть интеграция с Telegram Bot API
    // Для демо возвращаем фиктивную ссылку
    const invoiceLink = `https://t.me/invoice/${Date.now()}`

    return NextResponse.json({
      invoice_link: invoiceLink,
      success: true,
    })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
