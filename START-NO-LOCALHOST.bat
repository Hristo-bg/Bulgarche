@echo off
title Bulgarche Desktop - NO LOCALHOST
echo ===========================================
echo   BULGARCHE DESKTOP - NO LOCALHOST
echo ===========================================
echo.
echo This will BLOCK localhost and force desktop mode!
echo.

copy /y package-no-localhost.json package.json >nul

echo Installing Electron...
call npm install electron@28.3.3 electron-builder@24.13.3 --save-dev

echo.
echo Starting DESKTOP app (NO localhost)...
echo.
call npm start

pause
