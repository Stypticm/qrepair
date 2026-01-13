const fs = require('fs');
const path = require('path');

// Читаем файл
const filePath = path.join(__dirname, '..', 'src', 'core', 'appleModels.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Парсим все модели
const models = [];
const lines = content.split('\n');

let currentModel = {};

lines.forEach(line => {
  if (line.includes('model:')) {
    const match = line.match(/model: '([^']+)'/);
    if (match) {
      currentModel.model = match[1];
    }
  } else if (line.includes('variant:')) {
    const match = line.match(/variant: '([^']*)'/);
    if (match) {
      currentModel.variant = match[1] || 'base';
    }
  } else if (line.includes('storage:')) {
    const storageMatch = line.match(/storage: '([^']+)'/);
    if (storageMatch) {
      currentModel.storage = storageMatch[1];
    }
  } else if (line.includes('basePrice:')) {
    const match = line.match(/basePrice: (\d+)/);
    if (match) {
      currentModel.basePrice = parseInt(match[1]);
      
      // Добавляем модель в список
      const key = `${currentModel.model}-${currentModel.variant}-${currentModel.storage}`;
      if (!models.find(m => m.key === key)) {
        models.push({
          key,
          model: currentModel.model,
          variant: currentModel.variant,
          storage: currentModel.storage,
          basePrice: currentModel.basePrice
        });
      }
      
      currentModel = {};
    }
  }
});

// Группируем по моделям
const groupedModels = {};
models.forEach(model => {
  if (!groupedModels[model.model]) {
    groupedModels[model.model] = [];
  }
  groupedModels[model.model].push(model);
});

console.log('=== ПРОВЕРКА ЦЕН ===\n');

let hasErrors = false;

Object.keys(groupedModels).sort().forEach(model => {
  console.log(`📱 iPhone ${model}:`);
  
  const variants = [...new Set(groupedModels[model].map(m => m.variant))];
  const variantPrices = {};
  
  variants.forEach(variant => {
    const variantModels = groupedModels[model].filter(m => m.variant === variant);
    const prices = variantModels.map(m => m.basePrice);
    const uniquePrices = [...new Set(prices)];
    
    if (uniquePrices.length > 1) {
      console.log(`  ❌ ${variant === 'base' ? 'Базовая модель' : variant}: Разные цены для одной модели! ${uniquePrices.join(', ')}₽`);
      hasErrors = true;
    } else {
      variantPrices[variant] = uniquePrices[0];
      console.log(`  ✅ ${variant === 'base' ? 'Базовая модель' : variant}: ${uniquePrices[0]}₽`);
    }
  });
  
  // Проверяем логику цен внутри модели
  if (variantPrices.base && variantPrices.Pro && variantPrices['Pro Max']) {
    if (variantPrices.base >= variantPrices.Pro) {
      console.log(`  ⚠️  ПРОБЛЕМА: Базовая модель (${variantPrices.base}₽) дороже или равна Pro (${variantPrices.Pro}₽)`);
      hasErrors = true;
    }
    if (variantPrices.Pro >= variantPrices['Pro Max']) {
      console.log(`  ⚠️  ПРОБЛЕМА: Pro (${variantPrices.Pro}₽) дороже или равна Pro Max (${variantPrices['Pro Max']}₽)`);
      hasErrors = true;
    }
  }
  
  // Проверяем логику цен по объему памяти
  const baseModels = groupedModels[model].filter(m => m.variant === 'base');
  if (baseModels.length > 1) {
    const sortedByStorage = baseModels.sort((a, b) => {
      const storageOrder = { '64GB': 1, '128GB': 2, '256GB': 3, '512GB': 4, '1TB': 5 };
      return storageOrder[a.storage] - storageOrder[b.storage];
    });
    
    for (let i = 1; i < sortedByStorage.length; i++) {
      if (sortedByStorage[i].basePrice <= sortedByStorage[i-1].basePrice) {
        console.log(`  ⚠️  ПРОБЛЕМА: ${sortedByStorage[i].storage} (${sortedByStorage[i].basePrice}₽) не дороже ${sortedByStorage[i-1].storage} (${sortedByStorage[i-1].basePrice}₽)`);
        hasErrors = true;
      }
    }
  }
  
  console.log('');
});

// Проверяем общую логику цен между моделями
console.log('=== СРАВНЕНИЕ МОДЕЛЕЙ ===\n');

const modelComparisons = [];
Object.keys(groupedModels).sort().forEach(model => {
  const baseModel = groupedModels[model].find(m => m.variant === 'base' && m.storage === '128GB');
  if (baseModel) {
    modelComparisons.push({
      model: parseInt(model) || 0,
      price: baseModel.basePrice,
      name: model
    });
  }
});

modelComparisons.sort((a, b) => a.model - b.model);

for (let i = 1; i < modelComparisons.length; i++) {
  if (modelComparisons[i].price <= modelComparisons[i-1].price) {
    console.log(`⚠️  ПРОБЛЕМА: iPhone ${modelComparisons[i].name} (${modelComparisons[i].price}₽) не дороже iPhone ${modelComparisons[i-1].name} (${modelComparisons[i-1].price}₽)`);
    hasErrors = true;
  }
}

console.log('\n=== ИТОГИ ===');
if (hasErrors) {
  console.log('❌ Найдены проблемы с ценами!');
} else {
  console.log('✅ Все цены выглядят корректно!');
}

console.log(`\nВсего моделей: ${Object.keys(groupedModels).length}`);
console.log(`Всего записей: ${models.length}`);
