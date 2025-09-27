const { PrismaClient } = require('@prisma/client');

async function checkDevices() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Проверяем подключение к базе данных...');
    
    // Проверяем количество устройств
    const deviceCount = await prisma.device.count();
    console.log(`📱 Всего устройств в базе: ${deviceCount}`);
    
    if (deviceCount === 0) {
      console.log('❌ В базе данных нет устройств!');
      return;
    }
    
    // Получаем уникальные модели
    const models = await prisma.device.findMany({
      select: {
        model: true,
      },
      distinct: ['model'],
    });
    
    console.log(`📋 Найдено уникальных моделей: ${models.length}`);
    console.log('📋 Модели:', models.map(m => m.model));
    
    // Проверяем первые 5 устройств
    const sampleDevices = await prisma.device.findMany({
      take: 5,
      select: {
        model: true,
        variant: true,
        storage: true,
        color: true,
        basePrice: true,
      }
    });
    
    console.log('📱 Примеры устройств:');
    sampleDevices.forEach((device, index) => {
      console.log(`${index + 1}. ${device.model} ${device.variant} ${device.storage} ${device.color} - ${device.basePrice}₽`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка при проверке базы данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDevices();

