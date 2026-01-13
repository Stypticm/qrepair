const fs = require('fs')
const path = require('path')

// Читаем текущий файл
const filePath = path.join(
  __dirname,
  '..',
  'src',
  'core',
  'appleModels.ts'
)
const content = fs.readFileSync(filePath, 'utf8')

// Находим все уникальные модели (без дублирования по странам)
const models = []
const lines = content.split('\n')

let currentModel = {}
let modelCount = 0

lines.forEach((line) => {
  if (line.includes('model:')) {
    const match = line.match(/model: '([^']+)'/)
    if (match) {
      currentModel.model = match[1]
    }
  } else if (line.includes('variant:')) {
    const match = line.match(/variant: '([^']*)'/)
    if (match) {
      currentModel.variant = match[1]
    }
  } else if (line.includes('storage:')) {
    const storageMatch = line.match(/storage: '([^']+)'/)
    if (storageMatch) {
      currentModel.storage = storageMatch[1]
    }
  } else if (line.includes('color:')) {
    const colorMatch = line.match(/color: '([^']+)'/)
    if (colorMatch) {
      currentModel.color = colorMatch[1]
    }
  } else if (line.includes('basePrice:')) {
    const match = line.match(/basePrice: (\d+)/)
    if (match) {
      currentModel.basePrice = parseInt(match[1])

      // Добавляем модель в список (только один раз для каждой комбинации)
      const key = `${currentModel.model}-${
        currentModel.variant || 'base'
      }-${currentModel.storage}-${currentModel.color}`
      if (!models.find((m) => m.key === key)) {
        models.push({
          key,
          model: currentModel.model,
          variant: currentModel.variant || '',
          storage: currentModel.storage,
          color: currentModel.color,
          basePrice: currentModel.basePrice,
        })
      }

      currentModel = {}
    }
  }
})

console.log(
  `Найдено ${models.length} уникальных комбинаций моделей`
)

// Создаем записи для Японии
const japanEntries = []
models.forEach((model) => {
  // Для Японии используем eSIM (как для США и Европы)
  japanEntries.push(`  {
    model: '${model.model}',
    variant: '${model.variant}',
    storage: '${model.storage}',
    color: '${model.color}',
    country: 'Япония 🇯🇵',
    simType: 'eSIM',
    basePrice: ${model.basePrice},
  }`)
})

// Находим место для вставки (перед закрывающей скобкой массива)
const insertIndex = content.lastIndexOf('];')
if (insertIndex === -1) {
  console.error('Could not find end of array')
  process.exit(1)
}

// Вставляем новые записи для Японии
const newContent =
  content.slice(0, insertIndex) +
  ',\n' +
  japanEntries.join(',\n') +
  '\n' +
  content.slice(insertIndex)

// Записываем обновленный файл
fs.writeFileSync(filePath, newContent, 'utf8')

console.log(
  `Добавлено ${japanEntries.length} записей для Японии`
)
console.log(`Файл обновлен: ${filePath}`)
