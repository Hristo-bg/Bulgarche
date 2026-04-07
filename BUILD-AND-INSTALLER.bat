@echo off
REM Complete Build Process: Electron App → ISS Installer
REM This script builds the desktop app AND creates the installer

echo.
echo ========================================
echo BULGARCHE DESKTOP APP BUILD & INSTALLER
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Step 1: Installing dependencies...
if not exist "node_modules\" (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo Node modules already installed, skipping npm install
)

echo.
echo Step 2: Building Electron Desktop App...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS!
echo ========================================
echo.
echo Desktop app built successfully!
echo Location: dist-desktop\Bulgarche Desktop.exe
echo.
echo NEXT STEP: Create the Windows Installer
echo.
echo To create the installer:
echo 1. Open Inno Setup (download from https://jrsoftware.org/isdl.php if needed)
echo 2. Open file: installation\Bulgarche-Installer.iss
echo 3. Click: Build ^> Compile
echo 4. Installer will be created in: installation\
echo.
pause
