@echo off
setlocal enabledelayedexpansion
title Bulgarche Desktop Final Build
echo ===========================================
echo   Bulgarche Desktop Final Build v4.0.0
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

echo Checking icon file...
if not exist "icon\bulgarche-icon.png" (
  echo WARNING: Icon file not found at icon\bulgarche-icon.png
  echo Please make sure your icon is in the icon folder.
  echo.
  pause
)

echo Step 1: Building desktop application...
call "build-desktop-app.bat"
if errorlevel 1 (
  echo ERROR: Failed to build desktop application
  pause
  exit /b 1
)

echo.
echo Step 2: Checking build output...
if not exist "dist-desktop-final\win-unpacked\Bulgarche Desktop.exe" (
  echo ERROR: Built executable not found
  pause
  exit /b 1
)

echo.
echo ===========================================
echo   Build completed successfully!
echo ===========================================
echo.
echo Your desktop app is ready!
echo.
echo Available files:
echo - dist-desktop-final\win-unpacked\Bulgarche Desktop.exe (Portable version)
echo - dist-desktop-final\Bulgarche Desktop Setup *.exe (Installer)
echo.
echo Features:
echo - Opens as proper desktop window (not browser)
echo - Uses your icon everywhere (window, shortcuts, installer)
echo - Includes all settings and games
echo - Latest app version
echo.
echo To test: Run dist-desktop-final\win-unpacked\Bulgarche Desktop.exe
echo To create installer: Run BUILD-DESKTOP-INSTALLER-NEW.bat
echo.
pause
endlocal
