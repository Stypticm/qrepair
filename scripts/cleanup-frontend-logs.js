#!/usr/bin/env node

/**
 * Скрипт для очистки console.log из фронтенд компонентов
 * Удаляет console.log из .tsx файлов, но оставляет в API роутах
 */

const fs = require('fs')
const path = require('path')

// Файлы фронтенда для очистки (исключаем API роуты)
const frontendFiles = [
  'src/app/page.tsx',
  'src/app/request/final/page.tsx',
  'src/app/request/device-info/page.tsx',
  'src/app/request/submit/page.tsx',
  'src/app/request/form/page.tsx',
  'src/app/request/condition/page.tsx',
  'src/app/request/courier-booking/page.tsx',
  'src/app/request/delivery-options/page.tsx',
  'src/app/request/pickup-points/page.tsx',
  'src/app/request/additional-condition/page.tsx',
  'src/components',
  'src/stores',
  'src/hooks',
  'src/lib',
]

// Паттерны для удаления console.log
const patternsToRemove = [
  /console\.log\([^)]*\);?\s*\n/g,
  /console\.log\([^)]*\);?\s*$/gm,
  /console\.log\([^)]*\);/g,
]

// Паттерны, которые НЕ удаляем (критичные логи)
const criticalPatterns = [
  /console\.error\(/g,
  /console\.warn\(/g,
  /throw new Error\(/g,
  /return NextResponse\.json\(/g,
]

function shouldKeepLine(line) {
  // Проверяем, содержит ли строка критичные паттерны
  return criticalPatterns.some((pattern) =>
    pattern.test(line)
  )
}

function cleanFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath)

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Файл не найден: ${filePath}`)
      return
    }

    let content = fs.readFileSync(fullPath, 'utf8')
    const originalContent = content

    // Разбиваем на строки
    const lines = content.split('\n')
    const cleanedLines = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Проверяем, нужно ли сохранить строку
      if (shouldKeepLine(line)) {
        cleanedLines.push(line)
        continue
      }

      // Проверяем, содержит ли строка console.log для удаления
      const hasConsoleLog = /console\.log\(/.test(line)

      if (!hasConsoleLog) {
        cleanedLines.push(line)
      } else {
        // Проверяем, не является ли это критичным логом
        if (shouldKeepLine(line)) {
          cleanedLines.push(line)
        } else {
          console.log(`🗑️  Удаляем: ${line.trim()}`)
        }
      }
    }

    const cleanedContent = cleanedLines.join('\n')

    if (cleanedContent !== originalContent) {
      fs.writeFileSync(fullPath, cleanedContent, 'utf8')
      console.log(`✅ Очищен файл: ${filePath}`)
    } else {
      console.log(`ℹ️  Файл не изменился: ${filePath}`)
    }
  } catch (error) {
    console.error(
      `❌ Ошибка при обработке ${filePath}:`,
      error.message
    )
  }
}

function cleanDirectory(dirPath) {
  try {
    const fullPath = path.join(process.cwd(), dirPath)

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Директория не найдена: ${dirPath}`)
      return
    }

    const files = fs.readdirSync(fullPath, {
      withFileTypes: true,
    })

    for (const file of files) {
      const filePath = path.join(dirPath, file.name)

      if (file.isDirectory()) {
        cleanDirectory(filePath)
      } else if (
        file.name.endsWith('.tsx') ||
        file.name.endsWith('.ts')
      ) {
        cleanFile(filePath)
      }
    }
  } catch (error) {
    console.error(
      `❌ Ошибка при обработке директории ${dirPath}:`,
      error.message
    )
  }
}

function main() {
  console.log(
    '🧹 Начинаем очистку console.log из фронтенд компонентов...\n'
  )

  // Обрабатываем отдельные файлы
  frontendFiles.forEach((file) => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      cleanFile(file)
    } else {
      cleanDirectory(file)
    }
  })

  console.log('\n✅ Очистка завершена!')
  console.log('\n📝 Что было сделано:')
  console.log(
    '   • Удалены console.log из фронтенд компонентов'
  )
  console.log('   • Сохранены console.error и console.warn')
  console.log('   • API роуты не затронуты')
  console.log(
    '\n⚠️  ВАЖНО: Убедитесь, что приложение работает корректно!'
  )
}

if (require.main === module) {
  main()
}

module.exports = {
  cleanFile,
  cleanDirectory,
  patternsToRemove,
  criticalPatterns,
}
