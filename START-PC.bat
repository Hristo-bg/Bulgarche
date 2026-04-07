@echo off
setlocal enabledelayedexpansion
title Bulgarche PC (Desktop) Starter
echo ===========================================
echo   Starting Bulgarche Desktop (PC) Version
echo ===========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not in PATH
  echo Install from https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist "package-electron.json" (
  echo ERROR: package-electron.json not found in current folder
  echo Make sure you run this from the project root.
  echo.
  pause
  exit /b 1
)

if not exist "main-electron-final.js" (
  echo ERROR: main-electron-final.js not found in current folder
  echo Make sure you run this from the project root.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\electron" (
  echo Installing Electron for desktop...
  call npm install electron@14.2.9 electron-builder@22.14.5 --save-dev
  if errorlevel 1 (
    echo ERROR: Failed to install Electron
    pause
    exit /b 1
  )
)

echo Switching to desktop package.json temporarily...
copy /y package.json package.backup.json >nul
copy /y package-electron.json package.json >nul

echo Launching Electron desktop app...
echo.
call npm run start
set "ERRLVL=%ERRORLEVEL%"

echo Restoring original package.json...
if exist package.backup.json (
  del /f /q package.json >nul 2>&1
  ren package.backup.json package.json >nul
)

echo.
if "%ERRLVL%"=="0" (
  echo Desktop app closed. Press any key to exit...
) else (
  echo Desktop app exited with error code %ERRLVL%.
  echo Press any key to exit...
)
pause >nul
endlocal
