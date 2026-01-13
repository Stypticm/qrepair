const fs = require('fs')
const path = require('path')

// Читаем файл appleModels.ts
const appleModelsPath = path.join(
  __dirname,
  '../src/core/appleModels.ts'
)
const content = fs.readFileSync(appleModelsPath, 'utf8')

console.log('Начинаем экспорт в CSV...')

// Извлекаем массив iphones из файла
const arrayStart = content.indexOf(
  'export const iphones: IPhone[] = ['
)
const arrayEnd = content.lastIndexOf(']')

if (arrayStart === -1 || arrayEnd === -1) {
  console.error('Не удалось найти массив iphones в файле')
  process.exit(1)
}

const arrayContent = content.substring(
  arrayStart,
  arrayEnd + 1
)

// Парсим объекты из массива
const phones = []
const phoneRegex =
  /\{\s*model:\s*['"`]([^'"`]+)['"`],\s*variant:\s*['"`]([^'"`]*)['"`],\s*storage:\s*['"`]([^'"`]+)['"`],\s*color:\s*['"`]([^'"`]+)['"`],\s*country:\s*['"`]([^'"`]+)['"`],\s*simType:\s*['"`]([^'"`]+)['"`],\s*basePrice:\s*(\d+)/g

let match
while ((match = phoneRegex.exec(arrayContent)) !== null) {
  phones.push({
    model: match[1],
    variant: match[2],
    storage: match[3],
    color: match[4],
    country: match[5],
    simType: match[6],
    basePrice: parseInt(match[7]),
  })
}

console.log(`Найдено ${phones.length} моделей iPhone`)

// Создаем CSV контент
const csvHeader =
  '№,Модель,Вариант,Объем памяти,Цвет,Страна,Тип SIM,Базовая цена (₽)\n'
const csvRows = phones
  .map(
    (phone, index) =>
      `${index + 1},"${phone.model}","${phone.variant}","${
        phone.storage
      }","${phone.color}","${phone.country}","${
        phone.simType
      }",${phone.basePrice}`
  )
  .join('\n')

const csvContent = csvHeader + csvRows

// Сохраняем CSV файл
const outputPath = path.join(__dirname, 'iphone-models.csv')
fs.writeFileSync(outputPath, csvContent, 'utf8')

console.log(`✅ CSV файл создан: ${outputPath}`)
console.log(`📊 Экспортировано ${phones.length} записей`)

// Статистика по моделям
const modelStats = {}
phones.forEach((phone) => {
  const key = `${phone.model} ${phone.variant}`.trim()
  modelStats[key] = (modelStats[key] || 0) + 1
})

console.log('\n📈 Статистика по моделям:')
Object.entries(modelStats)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10)
  .forEach(([model, count]) => {
    console.log(`  ${model}: ${count} вариантов`)
  })

console.log(
  '\n💡 CSV файл можно открыть в Excel или Google Sheets'
)
