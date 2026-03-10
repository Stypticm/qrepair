import { NextResponse } from 'next/server'
import { api } from '@/services/api';
import { iphones, IPhone } from '@/core/appleModels'

// Функция для поиска модели по названию
function findModelByName(modelname: string): IPhone | null {
  const parts = modelname.split(' ')
  if (parts.length < 2) return null

  const model = parts[2]
  let variant = ''
  let storageIndex = 3

  if (parts[3] === 'R') {
    variant = 'R'
    storageIndex = 4
  } else if (parts[3] === 'S') {
    if (parts[4] === 'Max') {
      variant = 'S Max'
      storageIndex = 5
    } else {
      variant = 'S'
      storageIndex = 4
    }
  } else if (parts[3] === 'Pro') {
    if (parts[4] === 'Max') {
      variant = 'Pro Max'
      storageIndex = 5
    } else {
      variant = 'Pro'
      storageIndex = 4
    }
  } else if (parts[3] === 'mini') {
    variant = 'mini'
    storageIndex = 4
  } else if (parts[3] === 'Plus') {
    variant = 'Plus'
    storageIndex = 4
  } else if (parts[3] === 'SE') {
    variant = 'se'
    storageIndex = 4
  }

  const storage = parts[storageIndex]
  const color = parts[storageIndex + 1]
  const simType = parts[storageIndex + 2] + ' ' + parts[storageIndex + 3]
  const country = parts[storageIndex + 4]

  const colorMap: { [key: string]: string } = {
    Золотой: 'G',
    Красный: 'R',
    Синий: 'Bl',
    Белый: 'Wh',
    Черный: 'C',
  }

  const countryMap: { [key: string]: string } = {
    Китай: 'Китай 🇨🇳',
    США: 'США 🇺🇸',
    Япония: 'Япония 🇯🇵',
  }

  const mappedColor = colorMap[color] || color
  const mappedCountry = countryMap[country] || country

  let foundPhone = iphones.find(
    (phone: IPhone) =>
      phone.model === model &&
      phone.variant === variant &&
      phone.storage === storage &&
      phone.color === mappedColor &&
      phone.simType === simType &&
      phone.country === mappedCountry
  )

  if (!foundPhone && variant !== '') {
    foundPhone = iphones.find(
      (phone: IPhone) =>
        phone.model === model &&
        phone.variant === '' &&
        phone.storage === storage &&
        phone.color === mappedColor &&
        phone.simType === simType &&
        phone.country === mappedCountry
    )
  }

  return foundPhone || null
}

export async function POST(request: Request) {
  try {
    const { telegramId, modelname, price, imei, sn } =
      await request.json()

    if (!telegramId || !modelname) {
      return NextResponse.json(
        { error: 'Telegram ID and modelname required' },
        { status: 400 }
      )
    }

    // Ищем существующую заявку по telegramId через Go API
    const skupkaList = await api.list<any>('skupka', { telegramId, status: 'draft' });
    const existingRequest = skupkaList[0];

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Draft request not found' },
        { status: 404 }
      )
    }

    // Обновляем заявку как завершенную через Go API
    const updatedRequest = await api.patch<any>('skupka', existingRequest.id, {
      modelname,
      price: price || null,
      imei: imei || null,
      sn: sn || null,
      status: 'submitted',
      currentStep: null,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      requestId: updatedRequest.id,
      message: 'Заявка успешно отправлена',
    })
  } catch (error) {
    console.error('Error submitting request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
