@echo off
cd /d "%~dp0"
title Build True Desktop App

echo ===========================================
echo   Building True Desktop App (No Websites)
echo ===========================================
echo.

REM Check if electron-packager is installed
where electron-packager >nul 2>&1
if errorlevel 1 (
  echo Installing electron-packager...
  call npm install electron-packager@17.1.1 --save-dev
  if errorlevel 1 (
    echo ERROR: Failed to install electron-packager
    pause
    exit /b 1
  )
)

REM Check if all required files exist
if not exist "main-desktop.js" (
  echo ERROR: main-desktop.js not found
  pause
  exit /b 1
)

if not exist "public\index.html" (
  echo ERROR: public\index.html not found
  pause
  exit /b 1
)

if not exist "icon\bulgarche-icon.png" (
  echo ERROR: icon\bulgarche-icon.png not found
  pause
  exit /b 1
)

echo All required files found.
echo.
echo Building desktop app...
echo.

REM Switch to desktop package.json
copy /y package.json package.backup.json >nul
copy /y package-desktop.json package.json >nul

REM Create output directory
if not exist "dist-desktop" mkdir "dist-desktop"

REM Package the desktop app
npx electron-packager . Bulgarche --out=dist-desktop --overwrite --platform=win32 --arch=x64 --icon=icon/bulgarche-icon.png --prune=true --asar --app-version=4.0.0

set "PACK_RESULT=%ERRORLEVEL%"

REM Restore original package.json
copy /y package.backup.json package.json >nul
del /f /q package.backup.json >nul 2>&1

if %PACK_RESULT% neq 0 (
  echo ERROR: Failed to package desktop app
  pause
  exit /b 1
)

echo.
echo ===========================================
echo   Desktop app built successfully!
echo ===========================================
echo.
echo App location: dist-desktop\Bulgarche-win32-x64\
echo.
echo This is a TRUE desktop app:
echo - No websites, no browser
echo - Native Electron window
echo - All games and settings included
echo - Your custom icon
echo - Complete UI (disclaimer, tutorial, home)
echo.
pause
