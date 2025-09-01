const fs = require('fs')
const path = require('path')

// Читаем текущий config.ts
const configPath = path.join(
  __dirname,
  '../src/core/lib/config.ts'
)
let content = fs.readFileSync(configPath, 'utf8')

// Находим текущую версию
const versionMatch = content.match(
  /export const appVersion\s*=\s*process\.env\.NEXT_PUBLIC_APP_VERSION\s*\|\|\s*'([^']+)'/
)
if (!versionMatch) {
  console.error('Не удалось найти версию в config.ts')
  process.exit(1)
}

const currentVersion = versionMatch[1]
const parts = currentVersion.split('.')
const lastPart = parseInt(parts[parts.length - 1]) || 0
parts[parts.length - 1] = (lastPart + 1).toString()
const newVersion = parts.join('.')

// Заменяем версию - учитываем возможный перенос строки
content = content.replace(
  /export const appVersion\s*=\s*process\.env\.NEXT_PUBLIC_APP_VERSION\s*\|\|\s*'[^']+'/,
  `export const appVersion =\n  process.env.NEXT_PUBLIC_APP_VERSION || '${newVersion}'`
)

// Записываем обратно
fs.writeFileSync(configPath, content)

console.log(
  `✅ Версия обновлена: ${currentVersion} → ${newVersion}`
)
console.log(`📝 Файл обновлен: ${configPath}`)
