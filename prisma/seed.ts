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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
