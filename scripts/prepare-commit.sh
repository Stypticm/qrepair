#!/bin/bash

# Скрипт для подготовки к коммиту
# Выполняет: npm run update-version -> git add . -> git config --global core.autocrlf true

echo "🚀 Начинаем подготовку к коммиту..."

# 1. Обновляем версию
echo "📝 Обновляем версию..."
npm run update-version

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при обновлении версии!"
    exit 1
fi

# 2. Добавляем все файлы в git
echo "📁 Добавляем файлы в git..."
git add .

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при добавлении файлов в git!"
    exit 1
fi

# 3. Настраиваем autocrlf
echo "⚙️ Настраиваем autocrlf..."
git config --global core.autocrlf true

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при настройке autocrlf!"
    exit 1
fi

# 4. Добавляем файлы еще раз после настройки autocrlf
echo "📁 Добавляем файлы в git (повторно)..."
git add .

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при повторном добавлении файлов в git!"
    exit 1
fi

echo "✅ Подготовка к коммиту завершена!"
echo "💡 Теперь можете выполнить: git commit -m 'ваше сообщение'"
