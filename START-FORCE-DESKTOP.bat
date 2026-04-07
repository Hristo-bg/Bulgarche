@echo off
title Bulgarche Force Desktop
echo ===========================================
echo   FORCING BULGARCHE DESKTOP MODE
echo ===========================================
echo.

copy /y package-force.json package.json >nul

echo Installing Electron...
call npm install electron@28.3.3 electron-builder@24.13.3 --save-dev

echo.
echo Starting FORCED desktop app...
echo This will NOT open in browser!
echo.
call npm start

pause
