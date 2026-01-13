import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const invoiceData = await req.json()

    console.log(
      'Received invoice data:',
      JSON.stringify(invoiceData, null, 2)
    )

    // Валидация данных
    if (
      !invoiceData.title ||
      !invoiceData.currency ||
      !invoiceData.prices ||
      !Array.isArray(invoiceData.prices) ||
      invoiceData.prices.length === 0
    ) {
      console.log(
        'Validation failed for invoice data:',
        invoiceData
      )
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Здесь должна быть интеграция с Telegram Bot API
    // Для демо возвращаем фиктивную ссылку
    const invoiceLink = `https://t.me/invoice/${Date.now()}`

    console.log(
      'Invoice created successfully:',
      invoiceLink
    )

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
