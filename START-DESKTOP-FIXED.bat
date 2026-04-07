@echo off
title Bulgarche Desktop Fixed
echo Starting Bulgarche Desktop...

if not exist "package-desktop-fixed.json" (
  echo ERROR: package-desktop-fixed.json not found
  pause
  exit /b 1
)

if not exist "main-desktop-fixed.js" (
  echo ERROR: main-desktop-fixed.js not found
  pause
  exit /b 1
)

copy /y package-desktop-fixed.json package.json >nul
call npm install electron@28.3.3 electron-builder@24.13.3 --save-dev
call npm start

pause
