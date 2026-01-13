const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function assignRequest() {
  try {
    // Находим мастера с telegramId 531360988
    const master = await prisma.master.findUnique({
      where: { telegramId: '531360988' },
    })

    if (!master) {
      console.log('❌ Мастер не найден')
      return
    }

    console.log(
      '👤 Мастер найден:',
      master.id,
      master.username
    )

    // Находим заявку со статусом submitted, которая не назначена мастеру
    const request = await prisma.skupka.findFirst({
      where: {
        status: 'submitted',
        assignedMasterId: null,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!request) {
      console.log(
        '❌ Заявка со статусом submitted не найдена'
      )
      return
    }

    console.log(
      '📋 Заявка найдена:',
      request.id,
      request.modelname
    )

    // Назначаем заявку мастеру
    const updatedRequest = await prisma.skupka.update({
      where: { id: request.id },
      data: { assignedMasterId: master.id },
    })

    console.log(
      '✅ Заявка назначена мастеру:',
      updatedRequest.id
    )
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

assignRequest()
