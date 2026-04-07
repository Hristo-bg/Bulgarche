@echo off
setlocal enabledelayedexpansion
title Bulgarche Desktop Installer Builder
echo ===========================================
echo   Building Bulgarche Desktop Installer
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

echo Step 1: Building desktop application...
call "build-desktop-app.bat"
if errorlevel 1 (
  echo ERROR: Failed to build desktop application
  pause
  exit /b 1
)

echo.
echo Step 2: Checking for Inno Setup Compiler...
where iscc >nul 2>&1
if errorlevel 1 (
  echo WARNING: Inno Setup Compiler (iscc) not found in PATH
  echo Please install Inno Setup from https://jrsoftware.org/isinfo.php
  echo.
  echo You can still build the portable version manually from:
  echo dist-desktop-final\ folder
  echo.
  pause
  exit /b 1
)

echo.
echo Step 3: Creating installer with Inno Setup...
echo This may take a few minutes...
echo.

iscc "bulgarche-desktop-new.iss"
if errorlevel 1 (
  echo ERROR: Failed to create installer
  pause
  exit /b 1
)

echo.
echo ===========================================
echo   Installer created successfully!
echo ===========================================
echo.
echo The installer has been created in:
echo dist-installer-desktop\ folder
echo.
echo Available files:
echo - bulgarche-desktop-setup-v4.0.0.exe (Installer)
echo.
echo You can distribute this installer to users.
echo They will need Node.js installed to run the app.
echo.
pause
endlocal
