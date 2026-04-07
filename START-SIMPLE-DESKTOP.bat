@echo off
title Bulgarche Simple Desktop
echo ===========================================
echo   Starting Bulgarche Simple Desktop
echo ===========================================
echo.

copy /y package-simple.json package.json >nul

echo Installing Electron...
call npm install electron@28.3.3 electron-builder@24.13.3 --save-dev

echo.
echo Starting desktop app...
call npm start

pause
