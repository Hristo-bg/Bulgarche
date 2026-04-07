@echo off
setlocal enabledelayedexpansion
title Bulgarche Desktop App Launcher
echo ===========================================
echo   Starting Bulgarche Desktop App v4.0.0
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

if not exist "package-electron-desktop.json" (
  echo ERROR: package-electron-desktop.json not found in current folder
  echo Make sure you run this from the project root.
  echo.
  pause
  exit /b 1
)

if not exist "main-electron-desktop.js" (
  echo ERROR: main-electron-desktop.js not found in current folder
  echo Make sure you run this from the project root.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\electron" (
  echo Installing Electron for desktop...
  call npm install electron@28.3.3 electron-builder@24.13.3 --save-dev
  if errorlevel 1 (
    echo ERROR: Failed to install Electron
    pause
    exit /b 1
  )
)

echo Switching to desktop package.json temporarily...
if exist package.json (
  copy /y package.json package.backup.json >nul
)
copy /y package-electron-desktop.json package.json >nul

echo Launching Electron desktop app...
echo.
call npm start
set "ERRLVL=%ERRORLEVEL%"

echo Restoring original package.json...
if exist package.backup.json (
  del /f /q package.json >nul 2>&1
  ren package.backup.json package.json >nul
)

echo.
if "%ERRLVL%"=="0" (
  echo Desktop app closed successfully. Press any key to exit...
) else (
  echo Desktop app exited with error code %ERRLVL%.
  echo Press any key to exit...
)
pause >nul
endlocal
