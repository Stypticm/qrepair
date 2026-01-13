# Скрипт для подготовки к коммиту
# Выполняет: npm run update-version -> git add . -> git config --global core.autocrlf true

Write-Host "🚀 Начинаем подготовку к коммиту..." -ForegroundColor Green

# 1. Обновляем версию
Write-Host "📝 Обновляем версию..." -ForegroundColor Yellow
npm run update-version

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при обновлении версии!" -ForegroundColor Red
    exit 1
}

# 2. Добавляем все файлы в git
Write-Host "📁 Добавляем файлы в git..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при добавлении файлов в git!" -ForegroundColor Red
    exit 1
}

# 3. Настраиваем autocrlf
Write-Host "⚙️ Настраиваем autocrlf..." -ForegroundColor Yellow
git config --global core.autocrlf true

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при настройке autocrlf!" -ForegroundColor Red
    exit 1
}

# 4. Добавляем файлы еще раз после настройки autocrlf
Write-Host "📁 Добавляем файлы в git (повторно)..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при повторном добавлении файлов в git!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Подготовка к коммиту завершена!" -ForegroundColor Green
Write-Host "💡 Теперь можете выполнить: git commit -m 'ваше сообщение'" -ForegroundColor Cyan
