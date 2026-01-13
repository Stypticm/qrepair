#!/usr/bin/env node

/**
 * Скрипт для удаления тестовых API после успешного тестирования
 * Запускать только после подтверждения, что все работает!
 */

const fs = require('fs')
const path = require('path')

// Тестовые файлы для удаления
const testFiles = [
  'src/app/api/test-bot/route.ts',
  'src/app/api/test-telegram-send/route.ts',
]

// Директории для удаления (если они пустые)
const testDirs = [
  'src/app/api/test-bot',
  'src/app/api/test-telegram-send',
]

function removeFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath)

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Файл не найден: ${filePath}`)
      return false
    }

    fs.unlinkSync(fullPath)
    console.log(`🗑️  Удален файл: ${filePath}`)
    return true
  } catch (error) {
    console.error(
      `❌ Ошибка при удалении ${filePath}:`,
      error.message
    )
    return false
  }
}

function removeDir(dirPath) {
  try {
    const fullPath = path.join(process.cwd(), dirPath)

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Директория не найдена: ${dirPath}`)
      return false
    }

    // Проверяем, что директория пустая
    const files = fs.readdirSync(fullPath)
    if (files.length > 0) {
      console.log(
        `⚠️  Директория не пустая, пропускаем: ${dirPath}`
      )
      return false
    }

    fs.rmdirSync(fullPath)
    console.log(`🗑️  Удалена директория: ${dirPath}`)
    return true
  } catch (error) {
    console.error(
      `❌ Ошибка при удалении директории ${dirPath}:`,
      error.message
    )
    return false
  }
}

function main() {
  console.log('🧹 Удаляем тестовые API и страницы...\n')

  let removedFiles = 0
  let removedDirs = 0

  // Удаляем файлы
  testFiles.forEach((file) => {
    if (removeFile(file)) {
      removedFiles++
    }
  })

  // Удаляем пустые директории
  testDirs.forEach((dir) => {
    if (removeDir(dir)) {
      removedDirs++
    }
  })

  console.log(`\n✅ Удаление завершено!`)
  console.log(`   • Удалено файлов: ${removedFiles}`)
  console.log(`   • Удалено директорий: ${removedDirs}`)

  console.log('\n📝 Что было удалено:')
  console.log(
    '   • /api/test-bot - тестовый API для проверки бота'
  )
  console.log(
    '   • /api/test-telegram-send - тестовый API для отправки сообщений'
  )

  console.log(
    '\n⚠️  ВАЖНО: Убедитесь, что основная функциональность работает!'
  )
  console.log('   • Отправка заявок через Telegram WebApp')
  console.log('   • Получение уведомлений в бот')
  console.log('   • Сохранение данных в БД')
}

if (require.main === module) {
  main()
}

module.exports = { removeFile, removeDir }
