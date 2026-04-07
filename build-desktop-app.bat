@echo off
setlocal enabledelayedexpansion
title Bulgarche Desktop App Builder
echo ===========================================
echo   Building Bulgarche Desktop App v4.0.0
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

echo Backing up current package.json...
if exist package.json (
  copy /y package.json package.backup.json >nul
)

echo Setting up desktop package configuration...
copy /y package-electron-desktop.json package.json >nul

echo Installing Electron dependencies...
call npm install
if errorlevel 1 (
  echo ERROR: Failed to install dependencies
  if exist package.backup.json (
    del /f /q package.json >nul 2>&1
    ren package.backup.json package.json >nul
  )
  pause
  exit /b 1
)

echo.
echo Building desktop application...
call npm run build
if errorlevel 1 (
  echo ERROR: Failed to build desktop application
  if exist package.backup.json (
    del /f /q package.json >nul 2>&1
    ren package.backup.json package.json >nul
  )
  pause
  exit /b 1
)

echo.
echo Restoring original package.json...
if exist package.backup.json (
  del /f /q package.json >nul 2>&1
  ren package.backup.json package.json >nul
)

echo.
echo ===========================================
echo   Build completed successfully!
echo ===========================================
echo.
echo The desktop application has been built in:
echo dist-desktop-final\ folder
echo.
echo Available outputs:
echo - Windows Installer (NSIS)
echo - Portable Version
echo.
echo You can now run the ISS file to create
echo a professional installer:
echo.
echo   "bulgarche-desktop-new.iss"
echo.
pause
endlocal
