const fs = require('fs')
const path = require('path')

// Читаем файл appleModels.ts
const appleModelsPath = path.join(
  __dirname,
  '../src/core/appleModels.ts'
)
const content = fs.readFileSync(appleModelsPath, 'utf8')

console.log('Начинаем экспорт в Excel...')

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

// Создаем HTML таблицу (которую Excel может открыть)
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>iPhone Models</title>
    <style>
        table {
            border-collapse: collapse;
            width: 100%;
            font-family: Arial, sans-serif;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .number { text-align: center; width: 50px; }
        .model { width: 80px; }
        .variant { width: 120px; }
        .storage { width: 120px; }
        .color { width: 80px; }
        .country { width: 150px; }
        .sim { width: 120px; }
        .price { text-align: right; width: 150px; }
    </style>
</head>
<body>
    <h1>iPhone Models Database</h1>
    <p>Всего моделей: ${phones.length}</p>
    <table>
        <thead>
            <tr>
                <th class="number">№</th>
                <th class="model">Модель</th>
                <th class="variant">Вариант</th>
                <th class="storage">Объем памяти</th>
                <th class="color">Цвет</th>
                <th class="country">Страна</th>
                <th class="sim">Тип SIM</th>
                <th class="price">Базовая цена (₽)</th>
            </tr>
        </thead>
        <tbody>
            ${phones
              .map(
                (phone, index) => `
                <tr>
                    <td class="number">${index + 1}</td>
                    <td class="model">${phone.model}</td>
                    <td class="variant">${
                      phone.variant
                    }</td>
                    <td class="storage">${
                      phone.storage
                    }</td>
                    <td class="color">${phone.color}</td>
                    <td class="country">${
                      phone.country
                    }</td>
                    <td class="sim">${phone.simType}</td>
                    <td class="price">${phone.basePrice.toLocaleString()}</td>
                </tr>
            `
              )
              .join('')}
        </tbody>
    </table>
</body>
</html>
`

// Сохраняем HTML файл
const htmlPath = path.join(__dirname, 'iphone-models.html')
fs.writeFileSync(htmlPath, htmlContent, 'utf8')

// Также создаем CSV для совместимости
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
const csvPath = path.join(__dirname, 'iphone-models.csv')
fs.writeFileSync(csvPath, csvContent, 'utf8')

console.log(`✅ HTML файл создан: ${htmlPath}`)
console.log(`✅ CSV файл создан: ${csvPath}`)
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

console.log('\n💡 Инструкции:')
console.log('1. Откройте iphone-models.html в браузере')
console.log('2. Выделите всю таблицу (Ctrl+A)')
console.log('3. Скопируйте (Ctrl+C)')
console.log('4. Откройте Excel и вставьте (Ctrl+V)')
console.log(
  '5. Или просто откройте iphone-models.csv в Excel'
)
