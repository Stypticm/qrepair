import { PrismaClient } from '@prisma/client'
import { iphones } from '../src/core/appleModels'

const prisma = new PrismaClient()

async function migrateDevices() {
  try {
    console.log(
      '🚀 Начинаем миграцию устройств в базу данных...'
    )
    console.log(
      `📊 Найдено ${iphones.length} устройств для миграции`
    )

    // Очищаем существующие данные (опционально)
    console.log('🧹 Очищаем существующие данные...')
    await prisma.device.deleteMany({})
    console.log('✅ Существующие данные очищены')

    // Группируем данные для батчевой вставки
    const batchSize = 1000
    let processed = 0

    for (let i = 0; i < iphones.length; i += batchSize) {
      const batch = iphones.slice(i, i + batchSize)

      const devicesToCreate = batch.map((phone) => ({
        model: phone.model,
        variant: phone.variant || '',
        storage: phone.storage,
        color: phone.color,
        country: phone.country,
        simType: phone.simType,
        basePrice: phone.basePrice,
      }))

      await prisma.device.createMany({
        data: devicesToCreate,
        skipDuplicates: true,
      })

      processed += batch.length
      console.log(
        `📦 Обработано ${processed}/${
          iphones.length
        } устройств (${Math.round(
          (processed / iphones.length) * 100
        )}%)`
      )
    }

    // Проверяем результат
    const totalDevices = await prisma.device.count()
    console.log(
      `✅ Миграция завершена! В базе данных: ${totalDevices} устройств`
    )

    // Показываем статистику
    const stats = await prisma.device.groupBy({
      by: ['model'],
      _count: {
        model: true,
      },
      orderBy: {
        _count: {
          model: 'desc',
        },
      },
      take: 10,
    })

    console.log(
      '\n📈 Топ-10 моделей по количеству вариантов:'
    )
    stats.forEach((stat, index) => {
      console.log(
        `${index + 1}. ${stat.model}: ${
          stat._count.model
        } вариантов`
      )
    })
  } catch (error) {
    console.error('❌ Ошибка при миграции:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем миграцию
if (require.main === module) {
  migrateDevices()
    .then(() => {
      console.log('🎉 Миграция успешно завершена!')
      process.exit(0)
    })
    .catch((error) => {
      console.error(
        '💥 Миграция завершилась с ошибкой:',
        error
      )
      process.exit(1)
    })
}

export { migrateDevices }
