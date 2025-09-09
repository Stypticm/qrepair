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
      },
    }),
    prisma.point.upsert({
      where: { address: 'Ходынский бул., 4' },
      update: {},
      create: {
        address: 'Ходынский бул., 4',
      },
    }),
    prisma.point.upsert({
      where: { address: 'пр. Мира, 100' },
      update: {},
      create: {
        address: 'пр. Мира, 100',
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
        username: 'admin1',
        name: 'Админ 1',
        isActive: true,
        pointId: points[0].id,
      },
    }),
    prisma.master.upsert({
      where: { telegramId: '296925626' },
      update: {},
      create: {
        telegramId: '296925626',
        username: 'admin2',
        name: 'Админ 2',
        isActive: true,
        pointId: points[1].id,
      },
    }),
    prisma.master.upsert({
      where: { telegramId: '531360988' },
      update: {},
      create: {
        telegramId: '531360988',
        username: 'admin3',
        name: 'Админ 3',
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
