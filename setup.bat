@echo off
SETLOCAL EnableDelayedExpansion

echo ==========================================
echo   MicroFix V10 - Setup and Run Script
echo ==========================================

:: Check Node.js version
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install it from https://nodejs.org
    pause
    exit /b
)

echo [1/3] Installing dependencies...
call npm install

echo [2/3] Starting Backend Server...
start "MicroFix-Backend" cmd /c "npm run server"

echo [3/3] Starting Frontend...
start "MicroFix-Frontend" cmd /c "npm run dev"

echo.
echo ==========================================
echo   App is running!
echo   - Backend: http://localhost:3001
echo   - Frontend: http://localhost:5173
echo ==========================================
echo.
pause
