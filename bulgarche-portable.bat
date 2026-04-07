@echo off
cd /d "%~dp0"
title Bulgarche Desktop Portable

echo ===========================================
echo   Creating Bulgarche Desktop Portable
echo ===========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed
  echo Please install Node.js from https://nodejs.org/
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

echo All required files found.
echo.
echo Creating portable desktop app...
echo.

REM Create portable directory
if not exist "Bulgarche-Desktop" mkdir "Bulgarche-Desktop"

REM Copy all files
echo Copying application files...
xcopy /E /I /Y "simple-server.js" "Bulgarche-Desktop\"
xcopy /E /I /Y "public" "Bulgarche-Desktop\public\"
xcopy /E /I /Y "txt" "Bulgarche-Desktop\txt\"
xcopy /E /I /Y "audiofiles" "Bulgarche-Desktop\audiofiles\"
xcopy /E /I /Y "icon" "Bulgarche-Desktop\icon\"

REM Create launcher
echo Creating desktop launcher...
(
echo @echo off > "Bulgarche-Desktop\START-BULGARCHE.bat"
echo cd /d "%%~dp0" >> "Bulgarche-Desktop\START-BULGARCHE.bat"
echo title Bulgarche Desktop >> "Bulgarche-Desktop\START-BULGARCHE.bat"
echo echo Starting Bulgarche Desktop... >> "Bulgarche-Desktop\START-BULGARCHE.bat"
echo echo. >> "Bulgarche-Desktop\START-BULGARCHE.bat"
echo start /B node simple-server.js >> "Bulgarche-Desktop\START-BULGARCHE.bat"
echo timeout /t 3 /nobreak ^> nul >> "Bulgarche-Desktop\START-BULGARCHE.bat"
echo start "" "http://localhost:3000" >> "Bulgarche-Desktop\START-BULGARCHE.bat"
echo echo. >> "Bulgarche-Desktop\START-BULGARCHE.bat"
echo echo Bulgarche Desktop is running in your browser. >> "Bulgarche-Desktop\START-BULGARCHE.bat"
echo echo Close this window to stop the server. >> "Bulgarche-Desktop\START-BULGARCHE.bat"
echo pause ^> nul >> "Bulgarche-Desktop\START-BULGARCHE.bat"
)

REM Create desktop shortcut
echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Bulgarche Desktop.lnk'); $Shortcut.TargetPath = '%CD%\Bulgarche-Desktop\START-BULGARCHE.bat'; $Shortcut.IconLocation = '%CD%\Bulgarche-Desktop\icon\bulgarche-icon.png'; $Shortcut.Description = 'Learn Bulgarian with Bulgarche'; $Shortcut.Save()"

echo.
echo ===========================================
echo   Portable desktop app created!
echo ===========================================
echo.
echo Location: Bulgarche-Desktop\
echo.
echo To start: Double-click START-BULGARCHE.bat
echo Or use desktop shortcut: "Bulgarche Desktop.lnk"
echo.
echo This creates a desktop app with:
echo - All games and settings
echo - Complete UI (disclaimer, tutorial, home)
echo - Working server (no white screen)
echo - Desktop shortcut with icon
echo.
pause
