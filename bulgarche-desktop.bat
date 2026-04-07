@echo off
cd /d "%~dp0"
title Bulgarche Desktop

REM Hide console window and create desktop app
if "%1"=="" (
  start "" /MIN "%~f0" RUN
  exit /b
)

REM Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
  msg * ERROR: Node.js is not installed. Please install from https://nodejs.org/
  exit /b 1
)

REM Start the server silently
start /B node simple-server.js

REM Wait for server to start
timeout /t 3 /nobreak >nul

REM Open in default browser
start "" "http://localhost:3000"

REM Keep running in background
:loop
timeout /t 60 /nobreak >nul
goto loop
