const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupTestRequests() {
  try {
    // Удаляем заявки с тестовыми telegramId
    const testTelegramIds = [
      'browser_test_user',
      'test-user',
    ]

    for (const telegramId of testTelegramIds) {
      const deleted = await prisma.skupka.deleteMany({
        where: { telegramId },
      })
      console.log(
        `🗑️ Удалено заявок для ${telegramId}: ${deleted.count}`
      )
    }

    // Сбрасываем назначения мастеру для заявок с telegramId 531360988
    const reset = await prisma.skupka.updateMany({
      where: {
        telegramId: '531360988',
        assignedMasterId: { not: null },
      },
      data: {
        assignedMasterId: null,
        status: 'submitted',
      },
    })
    console.log(
      `🔄 Сброшено назначений для мастера: ${reset.count}`
    )

    console.log('✅ Очистка завершена')
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupTestRequests()
