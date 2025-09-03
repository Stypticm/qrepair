const fs = require('fs')
const path = require('path')

// Читаем файл appleModels.ts
const tsFilePath = path.join(
  __dirname,
  '..',
  'src',
  'core',
  'appleModels.ts'
)
const tsContent = fs.readFileSync(tsFilePath, 'utf8')

// Парсим данные из TypeScript файла
const phones = []
const lines = tsContent.split('\n')

let currentPhone = {}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim()

  if (line.includes('model:') && line.includes("'")) {
    const match = line.match(/'([^']+)'/)
    if (match) currentPhone.model = match[1]
  } else if (
    line.includes('variant:') &&
    line.includes("'")
  ) {
    const match = line.match(/'([^']+)'/)
    if (match) currentPhone.variant = match[1]
  } else if (
    line.includes('storage:') &&
    line.includes("'")
  ) {
    const match = line.match(/'([^']+)'/)
    if (match) currentPhone.storage = match[1]
  } else if (
    line.includes('color:') &&
    line.includes("'")
  ) {
    const match = line.match(/'([^']+)'/)
    if (match) currentPhone.color = match[1]
  } else if (
    line.includes('country:') &&
    line.includes("'")
  ) {
    const match = line.match(/'([^']+)'/)
    if (match) currentPhone.country = match[1]
  } else if (
    line.includes('simType:') &&
    line.includes("'")
  ) {
    const match = line.match(/'([^']+)'/)
    if (match) currentPhone.simType = match[1]
  } else if (line.includes('basePrice:')) {
    const match = line.match(/basePrice:\s*(\d+)/)
    if (match) {
      currentPhone.basePrice = parseInt(match[1])
    }
  } else if (
    line.includes('},') &&
    Object.keys(currentPhone).length === 7
  ) {
    phones.push({ ...currentPhone })
    currentPhone = {}
  }
}

// Создаем CSV заголовки
const headers = [
  'model',
  'variant',
  'storage',
  'color',
  'country',
  'simType',
  'basePrice',
]

// Конвертируем данные в CSV формат
const csvContent = [
  headers.join(','),
  ...phones.map((phone) =>
    [
      phone.model,
      phone.variant,
      phone.storage,
      phone.color,
      `"${phone.country}"`, // Оборачиваем в кавычки, так как содержит запятые
      phone.simType,
      phone.basePrice,
    ].join(',')
  ),
].join('\n')

// Сохраняем CSV файл с правильной кодировкой
const outputPath = path.join(__dirname, 'appleModels.csv')
fs.writeFileSync(outputPath, '\uFEFF' + csvContent, 'utf8') // Добавляем BOM для правильного отображения в Excel

console.log(`CSV файл создан: ${outputPath}`)
console.log(`Всего записей: ${phones.length}`)
