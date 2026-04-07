@echo off
title Build Fixed Installer
echo ===========================================
echo   Building Fixed Desktop Installer
echo ===========================================
echo.

if not exist "package-desktop-fixed.json" (
  echo ERROR: package-desktop-fixed.json not found
  pause
  exit /b 1
)

echo Setting up package.json...
copy /y package-desktop-fixed.json package.json >nul

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
echo   Installer created in dist-fixed folder
echo ===========================================
echo.
echo The installer will create a REAL desktop app
echo that opens as a window (not in Chrome)
echo.
pause
