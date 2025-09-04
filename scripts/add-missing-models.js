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

// Новые модели для добавления
const newModels = [
  // iPhone X (базовая модель)
  {
    model: 'X',
    variant: '',
    storage: '64GB',
    basePrice: 6000,
  },
  {
    model: 'X',
    variant: '',
    storage: '128GB',
    basePrice: 8000,
  },
  {
    model: 'X',
    variant: '',
    storage: '256GB',
    basePrice: 13000,
  },

  // iPhone XS
  {
    model: 'X',
    variant: 'S',
    storage: '64GB',
    basePrice: 9000,
  },
  {
    model: 'X',
    variant: 'S',
    storage: '128GB',
    basePrice: 13000,
  },
  {
    model: 'X',
    variant: 'S',
    storage: '256GB',
    basePrice: 15000,
  },
  {
    model: 'X',
    variant: 'S',
    storage: '512GB',
    basePrice: 20000,
  },

  // iPhone XS Max
  {
    model: 'X',
    variant: 'S Max',
    storage: '64GB',
    basePrice: 10000,
  },
  {
    model: 'X',
    variant: 'S Max',
    storage: '128GB',
    basePrice: 15000,
  },
  {
    model: 'X',
    variant: 'S Max',
    storage: '256GB',
    basePrice: 18000,
  },
  {
    model: 'X',
    variant: 'S Max',
    storage: '512GB',
    basePrice: 25000,
  },

  // iPhone 12 Pro
  {
    model: '12',
    variant: 'Pro',
    storage: '128GB',
    basePrice: 28000,
  },
  {
    model: '12',
    variant: 'Pro',
    storage: '256GB',
    basePrice: 30000,
  },
  {
    model: '12',
    variant: 'Pro',
    storage: '512GB',
    basePrice: 32000,
  },

  // iPhone 12 Pro Max
  {
    model: '12',
    variant: 'Pro Max',
    storage: '128GB',
    basePrice: 34000,
  },
  {
    model: '12',
    variant: 'Pro Max',
    storage: '256GB',
    basePrice: 38000,
  },
  {
    model: '12',
    variant: 'Pro Max',
    storage: '512GB',
    basePrice: 40000,
  },

  // iPhone 12 mini
  {
    model: '12',
    variant: 'mini',
    storage: '64GB',
    basePrice: 22000,
  },
  {
    model: '12',
    variant: 'mini',
    storage: '128GB',
    basePrice: 20000,
  },
  {
    model: '12',
    variant: 'mini',
    storage: '256GB',
    basePrice: 21000,
  },

  // iPhone 13 Pro
  {
    model: '13',
    variant: 'Pro',
    storage: '128GB',
    basePrice: 39000,
  },
  {
    model: '13',
    variant: 'Pro',
    storage: '256GB',
    basePrice: 40000,
  },
  {
    model: '13',
    variant: 'Pro',
    storage: '512GB',
    basePrice: 46000,
  },
  {
    model: '13',
    variant: 'Pro',
    storage: '1TB',
    basePrice: 50000,
  },

  // iPhone 13 Pro Max
  {
    model: '13',
    variant: 'Pro Max',
    storage: '128GB',
    basePrice: 43000,
  },
  {
    model: '13',
    variant: 'Pro Max',
    storage: '256GB',
    basePrice: 46000,
  },
  {
    model: '13',
    variant: 'Pro Max',
    storage: '512GB',
    basePrice: 50000,
  },
  {
    model: '13',
    variant: 'Pro Max',
    storage: '1TB',
    basePrice: 57000,
  },

  // iPhone 13 mini
  {
    model: '13',
    variant: 'mini',
    storage: '128GB',
    basePrice: 25000,
  },
  {
    model: '13',
    variant: 'mini',
    storage: '256GB',
    basePrice: 27000,
  },
  {
    model: '13',
    variant: 'mini',
    storage: '512GB',
    basePrice: 33000,
  },

  // iPhone 14 Pro
  {
    model: '14',
    variant: 'Pro',
    storage: '128GB',
    basePrice: 56000,
  },
  {
    model: '14',
    variant: 'Pro',
    storage: '256GB',
    basePrice: 50000,
  },
  {
    model: '14',
    variant: 'Pro',
    storage: '512GB',
    basePrice: 57000,
  },
  {
    model: '14',
    variant: 'Pro',
    storage: '1TB',
    basePrice: 58000,
  },

  // iPhone 14 Pro Max
  {
    model: '14',
    variant: 'Pro Max',
    storage: '128GB',
    basePrice: 53000,
  },
  {
    model: '14',
    variant: 'Pro Max',
    storage: '256GB',
    basePrice: 60000,
  },
  {
    model: '14',
    variant: 'Pro Max',
    storage: '512GB',
    basePrice: 63000,
  },
  {
    model: '14',
    variant: 'Pro Max',
    storage: '1TB',
    basePrice: 66000,
  },

  // iPhone 14 Plus
  {
    model: '14',
    variant: 'Plus',
    storage: '128GB',
    basePrice: 37000,
  },
  {
    model: '14',
    variant: 'Plus',
    storage: '256GB',
    basePrice: 40000,
  },
  {
    model: '14',
    variant: 'Plus',
    storage: '512GB',
    basePrice: 41000,
  },

  // iPhone 15 Pro
  {
    model: '15',
    variant: 'Pro',
    storage: '128GB',
    basePrice: 55000,
  },
  {
    model: '15',
    variant: 'Pro',
    storage: '256GB',
    basePrice: 80000,
  },
  {
    model: '15',
    variant: 'Pro',
    storage: '512GB',
    basePrice: 68000,
  },
  {
    model: '15',
    variant: 'Pro',
    storage: '1TB',
    basePrice: 72000,
  },

  // iPhone 15 Pro Max
  {
    model: '15',
    variant: 'Pro Max',
    storage: '128GB',
    basePrice: 55000,
  },
  {
    model: '15',
    variant: 'Pro Max',
    storage: '256GB',
    basePrice: 85000,
  },
  {
    model: '15',
    variant: 'Pro Max',
    storage: '512GB',
    basePrice: 90000,
  },
  {
    model: '15',
    variant: 'Pro Max',
    storage: '1TB',
    basePrice: 125000,
  },

  // iPhone 15 Plus
  {
    model: '15',
    variant: 'Plus',
    storage: '128GB',
    basePrice: 48000,
  },
  {
    model: '15',
    variant: 'Plus',
    storage: '256GB',
    basePrice: 53000,
  },
  {
    model: '15',
    variant: 'Plus',
    storage: '512GB',
    basePrice: 52000,
  },

  // iPhone 16 Pro
  {
    model: '16',
    variant: 'Pro',
    storage: '128GB',
    basePrice: 75000,
  },
  {
    model: '16',
    variant: 'Pro',
    storage: '256GB',
    basePrice: 90000,
  },
  {
    model: '16',
    variant: 'Pro',
    storage: '512GB',
    basePrice: 100000,
  },
  {
    model: '16',
    variant: 'Pro',
    storage: '1TB',
    basePrice: 115000,
  },

  // iPhone 16 Pro Max
  {
    model: '16',
    variant: 'Pro Max',
    storage: '128GB',
    basePrice: 75000,
  },
  {
    model: '16',
    variant: 'Pro Max',
    storage: '256GB',
    basePrice: 90000,
  },
  {
    model: '16',
    variant: 'Pro Max',
    storage: '512GB',
    basePrice: 105000,
  },
  {
    model: '16',
    variant: 'Pro Max',
    storage: '1TB',
    basePrice: 125000,
  },

  // iPhone 16 Plus
  {
    model: '16',
    variant: 'Plus',
    storage: '128GB',
    basePrice: 60000,
  },
  {
    model: '16',
    variant: 'Plus',
    storage: '256GB',
    basePrice: 72000,
  },
  {
    model: '16',
    variant: 'Plus',
    storage: '512GB',
    basePrice: 86000,
  },
]

// Функция для создания записи модели
function createModelEntry(model) {
  const colors = ['Bl', 'Wh', 'G', 'R']
  const countries = [
    'Китай 🇨🇳',
    'США 🇺🇸',
    'Европа 🇪🇺',
    'ОАЭ 🇦🇪',
  ]
  const simTypes = ['1 SIM', '2 SIM', 'eSIM']

  const entries = []

  countries.forEach((country) => {
    colors.forEach((color) => {
      if (country === 'США 🇺🇸' || country === 'Европа 🇪🇺') {
        // Для США и Европы используем eSIM
        entries.push(`  {
    model: '${model.model}',
    variant: '${model.variant}',
    storage: '${model.storage}',
    color: '${color}',
    country: '${country}',
    simType: 'eSIM',
    basePrice: ${model.basePrice},
  }`)
      } else {
        // Для Китая и ОАЭ используем 1 SIM и 2 SIM
        entries.push(`  {
    model: '${model.model}',
    variant: '${model.variant}',
    storage: '${model.storage}',
    color: '${color}',
    country: '${country}',
    simType: '1 SIM',
    basePrice: ${model.basePrice},
  }`)
        entries.push(`  {
    model: '${model.model}',
    variant: '${model.variant}',
    storage: '${model.storage}',
    color: '${color}',
    country: '${country}',
    simType: '2 SIM',
    basePrice: ${model.basePrice},
  }`)
      }
    })
  })

  return entries
}

// Генерируем все записи
const allEntries = []
newModels.forEach((model) => {
  allEntries.push(...createModelEntry(model))
})

// Находим место для вставки (перед закрывающей скобкой массива)
const insertIndex = content.lastIndexOf('];')
if (insertIndex === -1) {
  console.error('Could not find end of array')
  process.exit(1)
}

// Вставляем новые записи
const newContent =
  content.slice(0, insertIndex) +
  ',\n' +
  allEntries.join(',\n') +
  '\n' +
  content.slice(insertIndex)

// Записываем обновленный файл
fs.writeFileSync(filePath, newContent, 'utf8')

console.log(`Added ${allEntries.length} new model entries`)
console.log(`File updated: ${filePath}`)
