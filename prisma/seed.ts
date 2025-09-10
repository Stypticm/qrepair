import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Создаем точки приема
  const points = await Promise.all([
    prisma.point.upsert({
      where: { address: 'ул. Тверская, 15' },
      update: {},
      create: {
        address: 'ул. Тверская, 15',
        workingHours: '10:00 - 22:00',
      },
    }),
    prisma.point.upsert({
      where: { address: 'Ходынский бул., 4' },
      update: {},
      create: {
        address: 'Ходынский бул., 4',
        workingHours: '10:00 - 22:00',
      },
    }),
    prisma.point.upsert({
      where: { address: 'пр. Мира, 100' },
      update: {},
      create: {
        address: 'пр. Мира, 100',
        workingHours: '09:00 - 21:00',
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
