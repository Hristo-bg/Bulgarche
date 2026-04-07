# How to Build Your Desktop App Installer (ISS Version)

## The Problem
Your old ISS installer was using a Node.js web server that opened Google/browser. That's NOT what you want. You need a true desktop application.

## The Solution
I've created a proper Electron desktop app build system. Follow these steps:

---

## Step 1: Build the Electron Desktop App
Run this command in your project folder:

```bash
npm install
npm run build
```

Or double-click: `build-desktop-installer-final.bat`

**This creates**: `dist-desktop\Bulgarche Desktop.exe` and all required files

---

## Step 2: Create the Windows Installer Using ISS

You now have TWO options:

### Option A: Use the Updated Original ISS (Easiest)
1. Open Inno Setup Compiler
2. Open the file: `installation\Bulgarche-Installer.iss`
3. Click "Build" → "Compile"
4. The installer will be created in the `installation\` folder

**This ISS now properly points to:**
- `dist-desktop` folder (your Electron build)
- Creates an executable installer that launches the desktop app (NOT a browser)

### Option B: Use the New ISS
1. Open Inno Setup Compiler
2. Open the file: `installation\Bulgarche-Installer-Electron.iss`
3. Click "Build" → "Compile"
4. The installer will be created in the `installation\` folder

---

## Step 3: Install and Test
1. Run the generated `.exe` installer
2. Follow the installation wizard
3. **When it finishes, your app will open as a desktop application** ✅

---

## Key Changes Made

### What's Different:
```
OLD ISS (Broken):
- Pointed to: dist-desktop-new\win-unpacked
- Launched: BulgarcheLauncher.cs (Node.js server → opens browser/Google)
- Result: App opens in browser ❌

NEW ISS (Fixed):
- Points to: dist-desktop (proper Electron build)
- Launches: Bulgarche Desktop.exe (native Electron app)
- Result: App opens as desktop application ✅
```

### File Structure Now:
```
dist-desktop/
  ├── Bulgarche Desktop.exe        ← Main executable
  ├── resources/
  │   ├── app.asar                 ← Your app (HTML, JS, CSS)
  │   └── app/                     ← Public folder contents
  ├── locales/                     ← Translations
  └── [other Electron files]
```

---

## Troubleshooting

**Problem: Installer says files not found**
- Make sure you ran `npm run build` to create `dist-desktop/` folder
- Verify the files exist before running ISS compiler

**Problem: App still opens browser after install**
- You need to rebuild with the NEW configuration
- Delete `dist-desktop` folder
- Run `npm run build` again
- Recompile the ISS file

**Problem: Installer won't run**
- Make sure you have Inno Setup installed (free download)
- Check the ISS file path for `..\dist-desktop\` is correct

---

## Summary

1. ✅ Build: `npm run build` (or double-click `.bat` file)
2. ✅ Install: Open ISS file in Inno Setup, click Compile
3. ✅ Install the generated EXE to users
4. ✅ App opens as desktop app, NOT browser ✨
