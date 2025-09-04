const fs = require('fs');

// Читаем файл
const content = fs.readFileSync('src/core/appleModels.ts', 'utf8');
const lines = content.split('\n');

let currentModel = {};
const japanModels = [];

lines.forEach(line => {
  if (line.includes('model:')) {
    const match = line.match(/model: '([^']+)'/);
    if (match) currentModel.model = match[1];
  } else if (line.includes('variant:')) {
    const match = line.match(/variant: '([^']*)'/);
    if (match) currentModel.variant = match[1] || 'base';
  } else if (line.includes('storage:')) {
    const match = line.match(/storage: '([^']+)'/);
    if (match) currentModel.storage = match[1];
  } else if (line.includes("country: 'Япония")) {
    const modelName = `iPhone ${currentModel.model} ${currentModel.variant === 'base' ? '' : currentModel.variant} ${currentModel.storage}`;
    japanModels.push(modelName);
  }
});

const unique = [...new Set(japanModels)];

console.log('=== МОДЕЛИ С ЯПОНИЕЙ ===');
console.log(`Всего уникальных моделей: ${unique.length}`);
console.log('');

unique.forEach(model => {
  console.log(`📱 ${model}`);
});

console.log('');
console.log('=== СТАТИСТИКА ===');
console.log(`Всего записей с Японией: ${japanModels.length}`);
console.log(`Уникальных моделей: ${unique.length}`);
