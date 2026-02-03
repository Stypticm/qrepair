const fs = require('fs')
const path = require('path')

// Получаем тип обновления из аргументов командной строки
const updateType = process.argv[2] || 'patch' // patch, minor, major

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
const parts = currentVersion
  .split('.')
  .map((part) => parseInt(part) || 0)

// Убеждаемся, что у нас есть все три части версии
while (parts.length < 3) {
  parts.push(0)
}

let newVersion

switch (updateType) {
  case 'major':
    // 1.0.0 → 2.0.0
    parts[0] += 1
    parts[1] = 0
    parts[2] = 0
    break
  case 'minor':
    // 1.0.0 → 1.1.0
    parts[1] += 1
    parts[2] = 0
    break
  case 'patch':
  default:
    // 1.0.0 → 1.0.1
    parts[2] += 1
    break
}

newVersion = parts.join('.')

// Заменяем версию - учитываем возможный перенос строки
content = content.replace(
  /export const appVersion\s*=\s*process\.env\.NEXT_PUBLIC_APP_VERSION\s*\|\|\s*'[^']+'/,
  `export const appVersion =\n  process.env.NEXT_PUBLIC_APP_VERSION || '${newVersion}'`
)

// Записываем обратно
fs.writeFileSync(configPath, content)

console.log(
  `✅ Версия обновлена: ${currentVersion} → ${newVersion} (${updateType})`
)
// -----------------------------------------------------------------------------
// Обновляем public/sw.js
// -----------------------------------------------------------------------------
const swPath = path.join(__dirname, '../public/sw.js')
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8')
  
  // Заменяем const CACHE_NAME = 'qoqos-cache-v...'
  // Используем новую версию, заменяя точки на дефисы для безопасности
  const safeVersion = newVersion.replace(/\./g, '-')
  const newCacheName = `qoqos-cache-v${safeVersion}`
  
  const swMatch = swContent.match(/const CACHE_NAME = '([^']+)'/)
  if (swMatch) {
    swContent = swContent.replace(
      /const CACHE_NAME = '[^']+'/,
      `const CACHE_NAME = '${newCacheName}'`
    )
    fs.writeFileSync(swPath, swContent)
    console.log(`📝 Service Worker обновлен: ${swPath} (Cache: ${newCacheName})`)
  } else {
    console.warn('⚠️ Cache name not found in sw.js')
  }
} else {
    console.warn('⚠️ public/sw.js not found')
}

console.log(`📝 Файл обновлен: ${configPath}`)
console.log(`\n📋 Использование:`)
console.log(
  `  node scripts/update-version.js patch   # 1.0.0 → 1.0.1 (по умолчанию)`
)
console.log(
  `  node scripts/update-version.js minor   # 1.0.0 → 1.1.0`
)
console.log(
  `  node scripts/update-version.js major   # 1.0.0 → 2.0.0`
)
