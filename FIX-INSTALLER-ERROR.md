# Fix the Installer Error - Step by Step

## The Problem
The ISS compiler tried to find files that don't exist yet. The `dist-desktop` folder needs to be created by building the Electron app first.

## Quick Fix (2 Steps)

### Step 1️⃣: Build the Desktop App
Double-click this file:
```
BUILD-AND-INSTALLER.bat
```

This will:
- Install dependencies
- Build your Electron desktop app
- Create the `dist-desktop\` folder with all needed files
- Tell you when to move to Step 2

**Wait for the script to finish** (it will say "SUCCESS")

---

### Step 2️⃣: Create the Windows Installer
After building:

1. **Download Inno Setup** (if you don't have it):
   - Go to: https://jrsoftware.org/isdl.php
   - Download and install the latest version

2. **Compile the ISS file**:
   - Open **Inno Setup Compiler**
   - File → Open
   - Navigate to: `installation\Bulgarche-Installer.iss`
   - Click **Build** → **Compile**
   - Wait for completion

3. **Your installer is ready!**
   - Location: `installation\Bulgarche-Desktop-Setup-4.0.0.exe`
   - Users can now install your desktop app

---

## What Happens Now

When users run the installer:
```
Bulgarche-Desktop-Setup-4.0.0.exe
    ↓
Windows Install Wizard
    ↓
App installs to C:\Program Files\Bulgarche Desktop\
    ↓
Desktop app launches (NOT in browser) ✅
```

---

## If You Get Another Error

**"Path not found" or "dist-desktop doesn't exist"**
- Delete the `dist-desktop` folder completely
- Run `BUILD-AND-INSTALLER.bat` again
- Make sure it completes successfully before compiling ISS

**"Bulgarche Desktop.exe doesn't exist"**
- Same fix - rebuild using the BAT file
- The exe is created by the electron-builder tool during build

---

## How to Rebuild in the Future

Whenever you make changes to your app:
1. Run `BUILD-AND-INSTALLER.bat` 
2. Compile the ISS file again
3. You have a new installer

That's it! You're done once you complete both steps above.
