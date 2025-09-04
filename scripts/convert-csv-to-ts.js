const fs = require('fs')
const path = require('path')

// Читаем CSV файл
const csvPath = path.join(__dirname, 'appleModels.csv')
const csvContent = fs.readFileSync(csvPath, 'utf8')

// Парсим строки
const lines = csvContent.trim().split('\n')
const models = []

lines.forEach((line) => {
  // Убираем лишние пробелы и запятые
  const cleanLine = line.trim().replace(/,$/, '')

  // Парсим массив из строки
  try {
    const arrayMatch = cleanLine.match(/\[(.*)\]/)
    if (arrayMatch) {
      const arrayContent = arrayMatch[1]
      // Разделяем по запятым, учитывая кавычки
      const parts = []
      let current = ''
      let inQuotes = false
      let quoteChar = ''

      for (let i = 0; i < arrayContent.length; i++) {
        const char = arrayContent[i]

        if ((char === '"' || char === "'") && !inQuotes) {
          inQuotes = true
          quoteChar = char
        } else if (char === quoteChar && inQuotes) {
          inQuotes = false
          quoteChar = ''
        } else if (char === ',' && !inQuotes) {
          parts.push(current.trim())
          current = ''
          continue
        }

        current += char
      }

      if (current.trim()) {
        parts.push(current.trim())
      }

      // Очищаем кавычки
      const cleanParts = parts.map((part) => {
        const trimmed = part.trim()
        if (
          (trimmed.startsWith('"') &&
            trimmed.endsWith('"')) ||
          (trimmed.startsWith("'") && trimmed.endsWith("'"))
        ) {
          return trimmed.slice(1, -1)
        }
        return trimmed
      })

      if (cleanParts.length === 7) {
        models.push({
          model: cleanParts[0],
          variant: cleanParts[1],
          storage: cleanParts[2],
          color: cleanParts[3],
          country: cleanParts[4],
          simType: cleanParts[5],
          basePrice: parseInt(cleanParts[6]),
        })
      }
    }
  } catch (error) {
    console.error('Error parsing line:', line, error)
  }
})

// Генерируем TypeScript код
const tsContent = `export interface AppleModel {
  model: string;
  variant: string;
  storage: string;
  color: string;
  country: string;
  simType: string;
  basePrice: number;
}

export const appleModels: AppleModel[] = [
${models
  .map(
    (model) => `  {
    model: '${model.model}',
    variant: '${model.variant}',
    storage: '${model.storage}',
    color: '${model.color}',
    country: '${model.country}',
    simType: '${model.simType}',
    basePrice: ${model.basePrice},
  }`
  )
  .join(',\n')}
];`

// Записываем в файл
const outputPath = path.join(
  __dirname,
  '..',
  'src',
  'core',
  'appleModels.ts'
)
fs.writeFileSync(outputPath, tsContent, 'utf8')

console.log(
  `Converted ${models.length} models to TypeScript`
)
console.log(`Output written to: ${outputPath}`)
