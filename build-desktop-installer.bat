@echo off
cd /d "%~dp0"
title Build Bulgarche Desktop Installer

echo ===========================================
echo   Building Bulgarche Desktop Installer
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
if not exist "main-electron-final.js" (
  echo ERROR: main-electron-final.js not found
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

if not exist "package-installer.json" (
  echo ERROR: package-installer.json not found
  pause
  exit /b 1
)

echo All required files found.
echo.
echo Building Electron app...
echo.

REM Switch to installer package.json
copy /y package.json package.backup.json >nul
copy /y package-installer.json package.json >nul

REM Create output directory
if not exist "dist-installer" mkdir "dist-installer"

REM Package the Electron app
call electron-packager . Bulgarche --out=dist-installer --overwrite --platform=win32 --arch=x64 --icon=icon/bulgarche-icon.png --prune=true --ignore=node_modules --asar=true --version=4.0.0

set "PACK_RESULT=%ERRORLEVEL%"

REM Restore original package.json
copy /y package.backup.json package.json >nul
del /f /q package.backup.json >nul 2>&1

if %PACK_RESULT% neq 0 (
  echo ERROR: Failed to package Electron app
  pause
  exit /b 1
)

echo.
echo ===========================================
echo   Electron app packaged successfully!
echo ===========================================
echo.
echo App location: dist-installer\Bulgarche-win32-x64\
echo.
echo Now you can:
echo 1. Run the app directly from dist-installer\Bulgarche-win32-x64\Bulgarche.exe
echo 2. Use Inno Setup to create installer from bulgarche-desktop.iss
echo.
pause
