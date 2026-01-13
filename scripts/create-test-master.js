const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestMaster() {
  try {
    // Создаем тестового мастера
    const master = await prisma.master.create({
      data: {
        telegramId: '1', // Ваш telegramId
        username: 'admin_master',
        name: 'Админ Мастер',
        pointId: 1, // Привязываем к точке с ID 1
      }
    })

    console.log('✅ Тестовый мастер создан:', master)

    // Проверяем, что мастер может получить свои точки
    const masterWithPoint = await prisma.master.findUnique({
      where: { telegramId: '1' },
      include: { point: true }
    })

    console.log('✅ Мастер с точкой:', masterWithPoint)
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestMaster()
