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

// Новые цены согласно прайс-листу
const newPrices = {
  // iPhone X (базовая модель)
  'X-64GB': 6000,
  'X-128GB': 8000,
  'X-256GB': 13000,

  // iPhone XR
  'XR-64GB': 8000,
  'XR-128GB': 14000,
  'XR-256GB': 18000,

  // iPhone XS
  'XS-64GB': 9000,
  'XS-128GB': 13000,
  'XS-256GB': 15000,
  'XS-512GB': 20000,

  // iPhone XS Max
  'XS Max-64GB': 10000,
  'XS Max-128GB': 15000,
  'XS Max-256GB': 18000,
  'XS Max-512GB': 25000,

  // iPhone 16 Pro Max
  '16 Pro Max-128GB': 75000,
  '16 Pro Max-256GB': 90000,
  '16 Pro Max-512GB': 105000,
  '16 Pro Max-1TB': 125000,

  // iPhone 16 Pro
  '16 Pro-128GB': 75000,
  '16 Pro-256GB': 90000,
  '16 Pro-512GB': 100000,
  '16 Pro-1TB': 115000,

  // iPhone 16 Plus
  '16 Plus-128GB': 60000,
  '16 Plus-256GB': 72000,
  '16 Plus-512GB': 86000,

  // iPhone 16
  '16-128GB': 59000,
  '16-256GB': 72000,
  '16-512GB': 103000,

  // iPhone 15 Pro Max
  '15 Pro Max-128GB': 55000,
  '15 Pro Max-256GB': 85000,
  '15 Pro Max-512GB': 90000,
  '15 Pro Max-1TB': 125000,

  // iPhone 15 Pro
  '15 Pro-128GB': 55000,
  '15 Pro-256GB': 80000,
  '15 Pro-512GB': 68000,
  '15 Pro-1TB': 72000,

  // iPhone 15 Plus
  '15 Plus-128GB': 48000,
  '15 Plus-256GB': 53000,
  '15 Plus-512GB': 52000,

  // iPhone 15
  '15-128GB': 47000,
  '15-256GB': 56000,
  '15-512GB': 60000,

  // iPhone 14 Pro Max
  '14 Pro Max-128GB': 53000,
  '14 Pro Max-256GB': 60000,
  '14 Pro Max-512GB': 63000,
  '14 Pro Max-1TB': 66000,

  // iPhone 14 Pro
  '14 Pro-128GB': 56000,
  '14 Pro-256GB': 50000,
  '14 Pro-512GB': 57000,
  '14 Pro-1TB': 58000,

  // iPhone 14 Plus
  '14 Plus-128GB': 37000,
  '14 Plus-256GB': 40000,
  '14 Plus-512GB': 41000,

  // iPhone 14
  '14-128GB': 35000,
  '14-256GB': 37000,
  '14-512GB': 39000,

  // iPhone 13 Pro Max
  '13 Pro Max-128GB': 43000,
  '13 Pro Max-256GB': 46000,
  '13 Pro Max-512GB': 50000,
  '13 Pro Max-1TB': 57000,

  // iPhone 13 Pro
  '13 Pro-128GB': 39000,
  '13 Pro-256GB': 40000,
  '13 Pro-512GB': 46000,
  '13 Pro-1TB': 50000,

  // iPhone 13 mini
  '13 mini-128GB': 25000,
  '13 mini-256GB': 27000,
  '13 mini-512GB': 33000,

  // iPhone 13
  '13-128GB': 29000,
  '13-256GB': 35000,
  '13-512GB': 38000,

  // iPhone 12 Pro Max
  '12 Pro Max-128GB': 34000,
  '12 Pro Max-256GB': 38000,
  '12 Pro Max-512GB': 40000,

  // iPhone 12 Pro
  '12 Pro-128GB': 28000,
  '12 Pro-256GB': 30000,
  '12 Pro-512GB': 32000,

  // iPhone 12 mini
  '12 mini-64GB': 22000,
  '12 mini-128GB': 20000,
  '12 mini-256GB': 21000,

  // iPhone 12
  '12-64GB': 19000,
  '12-128GB': 23000,
  '12-256GB': 25000,

  // iPhone 11 Pro Max
  '11 Pro Max-64GB': 18000,
  '11 Pro Max-128GB': 21000,
  '11 Pro Max-256GB': 20000,
  '11 Pro Max-512GB': 28000,

  // iPhone 11 Pro
  '11 Pro-64GB': 16000,
  '11 Pro-128GB': 14000,
  '11 Pro-256GB': 22000,
  '11 Pro-512GB': 27000,

  // iPhone 11
  '11-64GB': 28000,
  '11-128GB': 24000,
  '11-256GB': 20000,
  '11-512GB': 28000,
}

// Функция для создания ключа модели
function getModelKey(model, variant, storage) {
  if (variant === 'R') {
    return `XR-${storage}`
  } else if (variant === 'S') {
    return `XS-${storage}`
  } else if (variant === 'S Max') {
    return `XS Max-${storage}`
  } else if (variant === 'Pro') {
    return `${model} Pro-${storage}`
  } else if (variant === 'Pro Max') {
    return `${model} Pro Max-${storage}`
  } else if (variant === 'Plus') {
    return `${model} Plus-${storage}`
  } else if (variant === 'mini') {
    return `${model} mini-${storage}`
  } else if (variant === '') {
    return `${model}-${storage}`
  }
  return `${model} ${variant}-${storage}`
}

// Обновляем цены
let updatedContent = content
let updateCount = 0

Object.entries(newPrices).forEach(([key, newPrice]) => {
  // Ищем все записи с этой моделью и вариантом
  const regex = new RegExp(
    `(model: '([^']+)',\\s*variant: '([^']*)',\\s*storage: '([^']+)',[^}]*basePrice: )\\d+`,
    'g'
  )

  updatedContent = updatedContent.replace(
    regex,
    (match, prefix, model, variant, storage) => {
      const modelKey = getModelKey(model, variant, storage)
      if (modelKey === key) {
        updateCount++
        return `${prefix}${newPrice}`
      }
      return match
    }
  )
})

// Записываем обновленный файл
fs.writeFileSync(filePath, updatedContent, 'utf8')

console.log(`Updated ${updateCount} price entries`)
console.log(`File updated: ${filePath}`)
