@echo off
echo Starting Bulgarche Mobile Version...
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if mobile-public folder exists
if not exist "mobile-public" (
    echo ERROR: mobile-public folder not found in current directory
    echo Make sure you are running this from the Bulgarche root folder
    echo.
    pause
    exit /b 1
)

REM Check if index.html exists in mobile-public
if not exist "mobile-public\index.html" (
    echo ERROR: index.html not found in mobile-public folder
    echo Make sure the mobile-public folder contains index.html
    echo.
    pause
    exit /b 1
)

REM Check if electron is installed
if not exist "node_modules\electron" (
    echo Installing Electron for mobile version...
    npm install electron electron-builder --save-dev
    if errorlevel 1 (
        echo ERROR: Failed to install Electron
        pause
        exit /b 1
    )
)

echo Starting Bulgarche mobile app...
echo The app will open in a phone-sized window
echo.

REM Copy mobile package.json temporarily
copy package-mobile.json package-temp.json >nul
copy package-temp.json package.json >nul

REM Start Mobile Electron app
npm run start

REM Restore original package.json
del package.json >nul
ren package-temp.json package.json >nul

echo.
echo Mobile app closed. Press any key to exit...
pause >nul
