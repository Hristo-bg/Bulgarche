@echo off
title Build Real Desktop Installer
echo ===========================================
echo   Building REAL Desktop Installer
echo ===========================================
echo.

if not exist "package-real-desktop.json" (
  echo ERROR: package-real-desktop.json not found
  pause
  exit /b 1
)

echo Setting up package.json...
copy /y package-real-desktop.json package.json >nul

echo Installing dependencies...
call npm install electron@28.3.3 electron-builder@24.13.3 --save-dev

echo.
echo Building desktop app...
call npx electron-builder --win

echo.
echo Building installer...
call npx electron-builder --win nsis

echo.
echo ===========================================
echo   REAL Desktop Installer Created!
echo ===========================================
echo.
echo Location: dist-real\bulgarche-desktop-real-setup.exe
echo.
echo This installer will create a REAL desktop app
echo that opens as a desktop window (NOT browser!)
echo.
pause
