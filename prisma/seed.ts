import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Создаем точки приема
  const points = await Promise.all([
    prisma.point.upsert({
      where: { address: 'ул. Тверская, 15' },
      update: {},
      create: {
        name: 'Точка приёма на Тверской',
        address: 'ул. Тверская, 15',
        workingHours: '10:00 - 22:00',
      },
    }),
    prisma.point.upsert({
      where: { address: 'Ходынский бул., 4' },
      update: {},
      create: {
        name: 'Точка приёма на Ходынском',
        address: 'Ходынский бул., 4',
        workingHours: '10:00 - 22:00',
      },
    }),
    prisma.point.upsert({
      where: { address: 'пр. Мира, 100' },
      update: {},
      create: {
        name: 'Точка приёма на Мира',
        address: 'пр. Мира, 100',
        workingHours: '09:00 - 21:00',
      },
    }),
    prisma.point.upsert({
      where: { address: 'ул. Пушкина, д. 10, офис 101' },
      update: {},
      create: {
        name: 'Точка приёма №1',
        address: 'ул. Пушкина, д. 10, офис 101',
        workingHours: '10:00 - 22:00',
      },
    }),
    prisma.point.upsert({
      where: { address: 'пр. Ленина, д. 25, офис 205' },
      update: {},
      create: {
        name: 'Точка приёма №2',
        address: 'пр. Ленина, д. 25, офис 205',
        workingHours: '09:00 - 21:00',
      },
    }),
    prisma.point.upsert({
      where: { address: 'ул. Гагарина, д. 5, офис 15' },
      update: {},
      create: {
        name: 'Точка приёма №3',
        address: 'ул. Гагарина, д. 5, офис 15',
        workingHours: '11:00 - 23:00',
      },
    }),
  ])

  console.log('✅ Точки приема созданы:', points)

  // Создаем мастеров
  const masters = await Promise.all([
    prisma.master.upsert({
      where: { telegramId: '1' },
      update: {},
      create: {
        telegramId: '1',
        username: 'testPC',
        name: 'Главный Админ',
        isActive: true,
        pointId: points[0].id,
      },
    }),
    prisma.master.upsert({
      where: { telegramId: '296925626' },
      update: {},
      create: {
        telegramId: '296925626',
        username: 'roman_qtwe',
        name: 'Роман Qtwe',
        isActive: true,
        pointId: points[1].id,
      },
    }),
    prisma.master.upsert({
      where: { telegramId: '531360988' },
      update: {},
      create: {
        telegramId: '531360988',
        username: 'misha_styptic',
        name: 'Миша Styptic',
        isActive: true,
        pointId: points[2].id,
      },
    }),
  ])

  console.log('✅ Мастера созданы:', masters)

  // Демо заявки Skupka
  const demoRequests = [
    {
      telegramId: 'browser_test_user',
      username: 'demo1',
      modelname: 'iPhone 13 Pro 256GB',
      price: 65000,
      priceRange: { min: 60000, max: 70000 },
      deviceData: {
        imei: '356789012345678',
        sn: 'XYZ12345',
        color: 'Graphite',
        storage: '256GB',
      },
      aiAnalysis: {
        condition: 'good',
        damagePercent: 5,
        notes: 'minor scratches',
      },
      photoUrls: ['/submit.png'],
      videoUrls: ['https://example.com/video1.mp4'],
      courier: null,
      deliveryMethod: 'pickup',
      pickupPoint: points[0].address,
    },
    {
      telegramId: 'browser_test_user',
      username: 'demo2',
      modelname: 'iPhone 12 128GB',
      price: 38000,
      priceRange: { min: 34000, max: 40000 },
      deviceData: {
        imei: '351111111111111',
        sn: 'ABC98765',
        color: 'Blue',
        storage: '128GB',
      },
      aiAnalysis: {
        condition: 'fair',
        damagePercent: 12,
        notes: 'battery wear',
      },
      photoUrls: ['/submit.png'],
      videoUrls: ['https://example.com/video2.mp4'],
      courier: {
        method: 'courier',
        address: 'Москва, Тверская 1',
        date: new Date().toISOString(),
        time: '18:00',
        confirmed: false,
      },
      deliveryMethod: 'courier',
      pickupPoint: null,
    },
    {
      telegramId: '296925626',
      username: 'roman_qtwe',
      modelname: 'iPhone 15 Pro 256GB',
      price: 105000,
      priceRange: { min: 99000, max: 112000 },
      deviceData: {
        imei: '359999999999999',
        sn: 'QWE12345',
        color: 'Natural Titanium',
        storage: '256GB',
      },
      aiAnalysis: {
        condition: 'excellent',
        damagePercent: 2,
        notes: 'like new',
      },
      photoUrls: ['/submit.png'],
      videoUrls: ['https://example.com/video3.mp4'],
      courier: null,
      deliveryMethod: 'pickup',
      pickupPoint: points[1].address,
    },
  ]

  for (const r of demoRequests) {
    await prisma.skupka.create({
      data: {
        telegramId: r.telegramId,
        username: r.username,
        status: 'paid',
        modelname: r.modelname,
        price: r.price,
        priceRange: r.priceRange as any,
        deviceData: r.deviceData as any,
        aiAnalysis: r.aiAnalysis as any,
        photoUrls: r.photoUrls,
        videoUrls: r.videoUrls,
        courier: r.courier as any,
        deliveryMethod: r.deliveryMethod,
        pickupPoint: r.pickupPoint,
      },
    })
  }

  console.log('✅ Демо заявки Skupka созданы')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
