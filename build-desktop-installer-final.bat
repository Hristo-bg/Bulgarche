@echo off
REM Build Bulgarche Desktop App Installer
REM This creates a proper Windows desktop application installer

echo.
echo ========================================
echo Building Bulgarche Desktop Installer
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Build the Windows installer
echo Building Windows installer...
call npm run build

if %errorlevel% neq 0 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Your installer is ready in: dist-desktop\
echo The app will open as a desktop application when installed.
echo.
pause
