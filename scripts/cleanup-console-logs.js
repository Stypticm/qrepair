#!/usr/bin/env node

/**
 * Скрипт для очистки console.log из API роутов
 * Запускать только после успешного тестирования!
 */

const fs = require('fs')
const path = require('path')

// Файлы API роутов, которые нужно очистить
const apiFiles = [
  'src/app/api/request/submit/route.ts',
  'src/app/api/request/submit-final/route.ts',
  'src/app/api/request/device-info/route.ts',
  'src/core/lib/sendTelegramMessage.ts',
  'src/app/api/test-bot/route.ts',
  'src/app/api/test-telegram-send/route.ts',
]

// Паттерны для удаления (оставляем только критичные логи)
const patternsToRemove = [
  // Удаляем отладочные console.log
  /console\.log\([^)]*Submit API[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Test Bot API[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Test Telegram Send[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Sending photo to Telegram[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Telegram API response[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Received modelname[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Found existing request[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Created new request[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Updated request[^)]*\);?\s*\n/g,
  /console\.log\([^)]*BOT_TOKEN exists[^)]*\);?\s*\n/g,
  /console\.log\([^)]*BOT_TOKEN length[^)]*\);?\s*\n/g,
  /console\.log\([^)]*BOT_TOKEN starts with[^)]*\);?\s*\n/g,
  /console\.log\([^)]*original telegramId[^)]*\);?\s*\n/g,
  /console\.log\([^)]*real telegramId[^)]*\);?\s*\n/g,
  /console\.log\([^)]*isTestId[^)]*\);?\s*\n/g,
  /console\.log\([^)]*isRealTelegramId[^)]*\);?\s*\n/g,
  /console\.log\([^)]*photoUrl[^)]*\);?\s*\n/g,
  /console\.log\([^)]*caption[^)]*\);?\s*\n/g,
  /console\.log\([^)]*message content[^)]*\);?\s*\n/g,
  /console\.log\([^)]*message sent successfully[^)]*\);?\s*\n/g,
  /console\.log\([^)]*telegramId[^)]*\);?\s*\n/g,
  /console\.log\([^)]*message[^)]*\);?\s*\n/g,
  /console\.log\([^)]*BOT_TOKEN exists[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Success[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Error[^)]*\);?\s*\n/g,
  /console\.log\([^)]*telegramId[^)]*\);?\s*\n/g,
  /console\.log\([^)]*message[^)]*\);?\s*\n/g,
  /console\.log\([^)]*BOT_TOKEN exists[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Success[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Error[^)]*\);?\s*\n/g,
  // Дополнительные паттерны для реальных console.log
  /console\.log\([^)]*🔍[^)]*\);?\s*\n/g,
  /console\.log\([^)]*🚀[^)]*\);?\s*\n/g,
  /console\.log\([^)]*✅[^)]*\);?\s*\n/g,
  /console\.log\([^)]*❌[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Received modelname[^)]*\);?\s*\n/g,
  /console\.log\([^)]*findModelByName[^)]*\);?\s*\n/g,
  /console\.log\([^)]*parts после split[^)]*\);?\s*\n/g,
  /console\.log\([^)]*извлеченные параметры[^)]*\);?\s*\n/g,
  /console\.log\([^)]*маппированные параметры[^)]*\);?\s*\n/g,
  /console\.log\([^)]*результат поиска модели[^)]*\);?\s*\n/g,
  /console\.log\([^)]*модель с вариантом не найдена[^)]*\);?\s*\n/g,
  /console\.log\([^)]*найдена базовая модель[^)]*\);?\s*\n/g,
  /console\.log\([^)]*базовая модель тоже не найдена[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Начинаем отправку Telegram[^)]*\);?\s*\n/g,
  /console\.log\([^)]*Telegram result[^)]*\);?\s*\n/g,
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

      // Проверяем, содержит ли строка паттерны для удаления
      const shouldRemove = patternsToRemove.some(
        (pattern) => pattern.test(line)
      )

      if (!shouldRemove) {
        cleanedLines.push(line)
      } else {
        console.log(`🗑️  Удаляем: ${line.trim()}`)
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

function main() {
  console.log(
    '🧹 Начинаем очистку console.log из API роутов...\n'
  )

  apiFiles.forEach((file) => {
    cleanFile(file)
  })

  console.log('\n✅ Очистка завершена!')
  console.log('\n📝 Что было сделано:')
  console.log('   • Удалены отладочные console.log')
  console.log(
    '   • Сохранены критичные console.error и console.warn'
  )
  console.log(
    '   • Сохранены throw new Error и return NextResponse.json'
  )
  console.log(
    '\n⚠️  ВАЖНО: Убедитесь, что тестирование прошло успешно!'
  )
}

if (require.main === module) {
  main()
}

module.exports = {
  cleanFile,
  patternsToRemove,
  criticalPatterns,
}
