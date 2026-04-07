@echo off
setlocal enabledelayedexpansion
title Test Bulgarche Desktop App
echo ===========================================
echo   Testing Bulgarche Desktop App
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
if exist "icon\bulgarche-icon.ico" (
  echo ✓ Icon file found: icon\bulgarche-icon.ico
) else (
  echo ✗ Icon file not found: icon\bulgarche-icon.ico
  pause
  exit /b 1
)

echo Checking main Electron file...
if exist "main-electron-desktop.js" (
  echo ✓ Main Electron file found
) else (
  echo ✗ Main Electron file not found
  pause
  exit /b 1
)

echo.
echo Starting desktop app...
echo The app should open as a DESKTOP WINDOW (not browser)
echo with your icon in the title bar and taskbar.
echo.
pause

call "START-DESKTOP.bat"

echo.
echo ===========================================
echo   Test completed!
echo ===========================================
echo.
echo If the app opened as a desktop window with your icon,
echo then everything is working correctly!
echo.
echo To build the final version:
echo   FINAL-DESKTOP-BUILD.bat
echo.
pause
endlocal
