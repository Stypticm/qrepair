const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkRequests() {
  try {
    // Получаем все заявки
    const allRequests = await prisma.skupka.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log('📋 Последние 10 заявок:')
    allRequests.forEach(request => {
      console.log(`- ID: ${request.id}`)
      console.log(`  Статус: ${request.status}`)
      console.log(`  Назначен мастеру: ${request.assignedMasterId || 'НЕ НАЗНАЧЕН'}`)
      console.log(`  Telegram ID: ${request.telegramId}`)
      console.log(`  Модель: ${request.modelname}`)
      console.log(`  Создана: ${request.createdAt}`)
      console.log('---')
    })

    // Получаем мастеров
    const masters = await prisma.master.findMany()
    console.log('\n👥 Мастера:')
    masters.forEach(master => {
      console.log(`- ID: ${master.id}, Telegram ID: ${master.telegramId}, Username: ${master.username}`)
    })

  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRequests()
