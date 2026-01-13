const fs = require('fs')
const path = require('path')

// Читаем файл
const filePath = path.join(
  __dirname,
  '..',
  'src',
  'core',
  'appleModels.ts'
)
const content = fs.readFileSync(filePath, 'utf8')

// Парсим все модели
const models = []
const lines = content.split('\n')

let currentModel = {}
let inModel = false

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
    const match = line.includes('storage:')
    if (match) {
      const storageMatch = line.match(/storage: '([^']+)'/)
      if (storageMatch) {
        currentModel.storage = storageMatch[1]
      }
    }
  } else if (line.includes('country:')) {
    const match = line.match(/country: '([^']+)'/)
    if (match) {
      currentModel.country = match[1]
    }
  } else if (line.includes('basePrice:')) {
    const match = line.match(/basePrice: (\d+)/)
    if (match) {
      currentModel.basePrice = parseInt(match[1])

      // Добавляем модель в список
      const key = `${currentModel.model}-${
        currentModel.variant || 'base'
      }-${currentModel.storage}`
      if (!models.find((m) => m.key === key)) {
        models.push({
          key,
          model: currentModel.model,
          variant: currentModel.variant || 'base',
          storage: currentModel.storage,
          basePrice: currentModel.basePrice,
        })
      }

      currentModel = {}
    }
  }
})

// Группируем по моделям
const groupedModels = {}
models.forEach((model) => {
  if (!groupedModels[model.model]) {
    groupedModels[model.model] = []
  }
  groupedModels[model.model].push(model)
})

// Выводим результаты
console.log('=== АНАЛИЗ МОДЕЛЕЙ ===\n')

Object.keys(groupedModels)
  .sort()
  .forEach((model) => {
    console.log(`📱 iPhone ${model}:`)
    const variants = [
      ...new Set(
        groupedModels[model].map((m) => m.variant)
      ),
    ]
    variants.forEach((variant) => {
      const variantModels = groupedModels[model].filter(
        (m) => m.variant === variant
      )
      const storages = variantModels
        .map((m) => m.storage)
        .join(', ')
      const price = variantModels[0].basePrice
      console.log(
        `  ${
          variant === 'base' ? 'Базовая модель' : variant
        }: ${storages} (${price}₽)`
      )
    })
    console.log('')
  })

// Проверяем страны
const countries = [
  ...new Set(
    models.map((m) => {
      // Найдем страну для этой модели
      const countryMatch = content.match(
        new RegExp(
          `model: '${m.model}',[\\s\\S]*?country: '([^']+)'`
        )
      )
      return countryMatch ? countryMatch[1] : 'Unknown'
    })
  ),
]

console.log('=== СТРАНЫ ===')
countries.forEach((country) => {
  console.log(`🌍 ${country}`)
})

console.log('\n=== СТАТИСТИКА ===')
console.log(`Всего уникальных комбинаций: ${models.length}`)
console.log(`Моделей: ${Object.keys(groupedModels).length}`)
console.log(`Стран: ${countries.length}`)
