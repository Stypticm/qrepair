#!/bin/bash

echo "🚀 Starting Price Parser Services..."

echo ""
echo "📦 Installing Python dependencies..."
cd python-parser
pip install -r requirements.txt

echo ""
echo "🐍 Starting Python Parser Service..."
python start.py &
PYTHON_PID=$!

echo ""
echo "⏳ Waiting for Python service to start..."
sleep 5

echo ""
echo "🌐 Starting Next.js development server..."
cd ..
npm run dev &
NEXTJS_PID=$!

# Функция для корректного завершения процессов
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $PYTHON_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    exit 0
}

# Перехватываем сигналы для корректного завершения
trap cleanup SIGINT SIGTERM

# Ждем завершения процессов
wait
