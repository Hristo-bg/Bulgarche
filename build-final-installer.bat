@echo off
cd /d "%~dp0"
title Build Final Bulgarche Desktop Installer

echo ===========================================
echo   Building Final Bulgarche Desktop Installer
echo ===========================================
echo.

REM Check if Inno Setup is installed
where iscc >nul 2>&1
if errorlevel 1 (
  echo ERROR: Inno Setup is not installed
  echo Please download and install Inno Setup from:
  echo https://jrsoftware.org/isinfo.php
  echo.
  pause
  exit /b 1
)

REM Check if all required files exist
if not exist "simple-server.js" (
  echo ERROR: simple-server.js not found
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

if not exist "bulgarche-desktop-installer.iss" (
  echo ERROR: bulgarche-desktop-installer.iss not found
  pause
  exit /b 1
)

echo All required files found.
echo.
echo Building installer...
echo.

REM Create output directory
if not exist "dist-installer" mkdir "dist-installer"

REM Build the installer
iscc "bulgarche-desktop-installer.iss"

if errorlevel 1 (
  echo ERROR: Failed to build installer
  pause
  exit /b 1
)

echo.
echo ===========================================
echo   Installer built successfully!
echo ===========================================
echo.
echo Installer location: dist-installer\bulgarche-desktop-setup.exe
echo.
echo This installer creates:
echo - Desktop shortcut that starts Bulgarche in its own window
echo - Complete app with all games and settings
echo - Uses the same working version as START-PC.bat
echo - Professional desktop experience
echo.
pause
