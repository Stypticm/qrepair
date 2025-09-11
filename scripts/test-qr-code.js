// Тестовый скрипт для проверки QR кода
const testQRData = {
  skupkaId: "test-request-123",
  pointId: 1,
  timestamp: Date.now()
};

console.log('🔍 Тестовые данные QR кода:');
console.log(JSON.stringify(testQRData, null, 2));

console.log('\n📱 Для тестирования:');
console.log('1. Откройте страницу "Мои устройства" как клиент');
console.log('2. Создайте заявку со статусом "submitted"');
console.log('3. Сгенерируйте QR код');
console.log('4. Перейдите на страницу мастера');
console.log('5. Нажмите "Сканировать QR код"');
console.log('6. Наведите камеру на QR код');

console.log('\n✅ QR сканер должен:');
console.log('- Открыть камеру');
console.log('- Распознать QR код');
console.log('- Извлечь skupkaId');
console.log('- Добавить заявку к мастеру');
