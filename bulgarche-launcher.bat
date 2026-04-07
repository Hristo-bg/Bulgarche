@echo off
cd /d "%~dp0"
title Bulgarche Desktop

echo ===========================================
echo   Starting Bulgarche Desktop
echo ===========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed
  echo Please install Node.js from https://nodejs.org/
  echo.
  pause
  exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
  )
)

REM Start the application
echo Starting Bulgarche Desktop...
echo.
start /B node simple-server.js

timeout /t 3 /nobreak >nul

echo Opening application...
start "" "http://localhost:3000"

echo.
echo Bulgarche Desktop is running in your browser.
echo Close this window to stop the server.
echo.
pause
