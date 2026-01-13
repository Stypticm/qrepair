const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTestPoints() {
  try {
    // Добавляем тестовые точки приёма
    const testPoints = [
      {
        name: 'Точка приёма №1',
        address: 'ул. Пушкина, д. 10, офис 101',
        workingHours: '10:00 - 22:00',
      },
      {
        name: 'Точка приёма №2', 
        address: 'пр. Ленина, д. 25, офис 205',
        workingHours: '09:00 - 21:00',
      },
      {
        name: 'Точка приёма №3',
        address: 'ул. Гагарина, д. 5, офис 15',
        workingHours: '11:00 - 23:00',
      }
    ]

    for (const point of testPoints) {
      const existingPoint = await prisma.point.findFirst({
        where: { address: point.address }
      })

      if (!existingPoint) {
        await prisma.point.create({
          data: point
        })
        console.log(`✅ Добавлена точка: ${point.name} - ${point.address}`)
      } else {
        console.log(`⚠️ Точка уже существует: ${point.name}`)
      }
    }

    // Показываем все точки
    const allPoints = await prisma.point.findMany()
    console.log('\n📋 Все точки приёма:')
    allPoints.forEach(point => {
      console.log(`- ID: ${point.id}, Название: ${point.name}, Адрес: ${point.address}`)
    })

  } catch (error) {
    console.error('❌ Ошибка при добавлении точек:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestPoints()
