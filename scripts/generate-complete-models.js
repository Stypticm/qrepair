const fs = require('fs')
const path = require('path')

// Полный список всех моделей с ценами
const allModels = [
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

  // iPhone XR
  {
    model: 'X',
    variant: 'R',
    storage: '64GB',
    basePrice: 8000,
  },
  {
    model: 'X',
    variant: 'R',
    storage: '128GB',
    basePrice: 14000,
  },
  {
    model: 'X',
    variant: 'R',
    storage: '256GB',
    basePrice: 18000,
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

  // iPhone 11
  {
    model: '11',
    variant: '',
    storage: '64GB',
    basePrice: 28000,
  },
  {
    model: '11',
    variant: '',
    storage: '128GB',
    basePrice: 24000,
  },
  {
    model: '11',
    variant: '',
    storage: '256GB',
    basePrice: 20000,
  },
  {
    model: '11',
    variant: '',
    storage: '512GB',
    basePrice: 28000,
  },

  // iPhone 11 Pro
  {
    model: '11',
    variant: 'Pro',
    storage: '64GB',
    basePrice: 16000,
  },
  {
    model: '11',
    variant: 'Pro',
    storage: '128GB',
    basePrice: 14000,
  },
  {
    model: '11',
    variant: 'Pro',
    storage: '256GB',
    basePrice: 22000,
  },
  {
    model: '11',
    variant: 'Pro',
    storage: '512GB',
    basePrice: 27000,
  },

  // iPhone 11 Pro Max
  {
    model: '11',
    variant: 'Pro Max',
    storage: '64GB',
    basePrice: 18000,
  },
  {
    model: '11',
    variant: 'Pro Max',
    storage: '128GB',
    basePrice: 21000,
  },
  {
    model: '11',
    variant: 'Pro Max',
    storage: '256GB',
    basePrice: 20000,
  },
  {
    model: '11',
    variant: 'Pro Max',
    storage: '512GB',
    basePrice: 28000,
  },

  // iPhone 12
  {
    model: '12',
    variant: '',
    storage: '64GB',
    basePrice: 19000,
  },
  {
    model: '12',
    variant: '',
    storage: '128GB',
    basePrice: 23000,
  },
  {
    model: '12',
    variant: '',
    storage: '256GB',
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

  // iPhone 13
  {
    model: '13',
    variant: '',
    storage: '128GB',
    basePrice: 29000,
  },
  {
    model: '13',
    variant: '',
    storage: '256GB',
    basePrice: 35000,
  },
  {
    model: '13',
    variant: '',
    storage: '512GB',
    basePrice: 38000,
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

  // iPhone 14
  {
    model: '14',
    variant: '',
    storage: '128GB',
    basePrice: 35000,
  },
  {
    model: '14',
    variant: '',
    storage: '256GB',
    basePrice: 37000,
  },
  {
    model: '14',
    variant: '',
    storage: '512GB',
    basePrice: 39000,
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

  // iPhone 15
  {
    model: '15',
    variant: '',
    storage: '128GB',
    basePrice: 47000,
  },
  {
    model: '15',
    variant: '',
    storage: '256GB',
    basePrice: 56000,
  },
  {
    model: '15',
    variant: '',
    storage: '512GB',
    basePrice: 60000,
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

  // iPhone 16
  {
    model: '16',
    variant: '',
    storage: '128GB',
    basePrice: 59000,
  },
  {
    model: '16',
    variant: '',
    storage: '256GB',
    basePrice: 72000,
  },
  {
    model: '16',
    variant: '',
    storage: '512GB',
    basePrice: 103000,
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
allModels.forEach((model) => {
  allEntries.push(...createModelEntry(model))
})

// Генерируем TypeScript код
const tsContent = `export interface IPhone {
  model: string;
  variant: string;
  storage: string;
  color: string;
  country: string;
  simType: string;
  basePrice: number; // Базовая цена в рублях (средняя по РФ, -10%)
}

export const iphones: IPhone[] = [
${allEntries.join(',\n')}
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

console.log(`Generated ${allEntries.length} model entries`)
console.log(`Output written to: ${outputPath}`)
