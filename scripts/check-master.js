const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkMaster() {
  try {
    // Проверяем мастера с telegramId = '1'
    let master = await prisma.master.findUnique({
      where: { telegramId: '1' },
      include: { point: true }
    })

    console.log('🔍 Мастер 1:', master)

    if (master) {
      console.log('✅ Мастер 1 найден!')
      console.log('📍 Точка:', master.point)
      
      if (!master.point) {
        console.log('❌ У мастера 1 НЕТ точки!')
        
        // Обновляем мастера, добавляя точку
        master = await prisma.master.update({
          where: { telegramId: '1' },
          data: { pointId: 1 }
        })
        console.log('✅ Точка добавлена для мастера 1:', master)
      }
    } else {
      console.log('❌ Мастер 1 не найден!')
    }

    // Проверяем мастера с telegramId = '531360988'
    let master2 = await prisma.master.findUnique({
      where: { telegramId: '531360988' },
      include: { point: true }
    })

    console.log('🔍 Мастер 2:', master2)

    if (master2) {
      console.log('✅ Мастер 2 найден!')
      console.log('📍 Точка:', master2.point)
      
      if (!master2.point) {
        console.log('❌ У мастера 2 НЕТ точки!')
        
        // Обновляем мастера, добавляя точку
        master2 = await prisma.master.update({
          where: { telegramId: '531360988' },
          data: { pointId: 2 }
        })
        console.log('✅ Точка добавлена для мастера 2:', master2)
      }
    } else {
      console.log('❌ Мастер 2 не найден! Создаем...')
      
      // Создаем мастера 2
      master2 = await prisma.master.create({
        data: {
          telegramId: '531360988',
          username: 'admin_master_2',
          name: 'Админ Мастер 2',
          pointId: 2
        }
      })
      console.log('✅ Мастер 2 создан:', master2)
    }
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMaster()
