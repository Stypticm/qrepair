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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
