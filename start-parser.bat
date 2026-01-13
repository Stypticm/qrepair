@echo off
echo 🚀 Starting Price Parser Services...

echo.
echo 📦 Installing Python dependencies...
cd python-parser
pip install -r requirements.txt

echo.
echo 🐍 Starting Python Parser Service...
start "Python Parser" cmd /k "python start.py"

echo.
echo ⏳ Waiting for Python service to start...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 Starting Next.js development server...
cd ..
npm run dev

pause
