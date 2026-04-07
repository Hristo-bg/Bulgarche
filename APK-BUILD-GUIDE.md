# Complete APK Build and Installation Guide

## 🎯 Quick Summary
Building the APK takes 3 main steps:
1. **Install Prerequisites** (one-time setup)
2. **Build the APK** (run script)
3. **Install on Phone** (simple)

---

## 📋 STEP 1: Install Prerequisites

### A. Install Java Development Kit (JDK)

**Windows:**
1. Download from: https://www.oracle.com/java/technologies/downloads/
2. Choose "Java SE Development Kit" (version 11 or 17)
3. Run installer and follow defaults
4. Restart your computer

**Verify installation:**
```powershell
java -version
javac -version
```

Both should show version info.

---

### B. Install Android SDK

**Option 1: Android Studio (Recommended)**
1. Download from: https://developer.android.com/studio
2. Run installer (follow defaults)
3. Open Android Studio
4. Go to: Tools → SDK Manager
5. Install:
   - Android SDK Platform 33 (or latest)
   - Android SDK Build-Tools 33.0.1
   - Android Emulator (optional, for testing)

**Option 2: Command Line Tools Only**
1. Download from: https://developer.android.com/studio#command-tools
2. Extract to `C:\Android\sdk\cmdline-tools`
3. Create folder: `C:\Android\sdk`

---

### C. Set Environment Variables

**Windows:**
1. Press `Win + X` → Select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Click "New" under System variables
5. Create two new variables:

**Variable 1:**
- Name: `ANDROID_HOME`
- Value: `C:\Android\sdk`

**Variable 2:**
- Name: `JAVA_HOME`
- Value: `C:\Program Files\Java\jdk-17` (or your JDK path)

6. Click OK and restart PowerShell

**Verify:**
```powershell
echo $env:ANDROID_HOME
echo $env:JAVA_HOME
```

Both should show their paths.

---

### D. Install Cordova CLI

**In PowerShell:**
```powershell
npm install -g cordova
```

**Verify:**
```powershell
cordova --version
```

Should show version number.

---

## 🛠️ STEP 2: Build the APK

### Simple Method (Recommended)

Open PowerShell and run:

```powershell
# Navigate to your project
Set-Location "D:\bulgarche\bulgarche 4.0 - Copy-new original"

# Run the build script
.\BUILD-APK-WORKING.ps1
```

**This script will:**
- Check prerequisites ✓
- Clean old builds ✓
- Copy all files to mobile/www ✓
- Build the APK ✓
- Show you where it's located ✓

**Wait time:** 5-15 minutes depending on your computer

**Output:**
```
SUCCESS - APK built!
  Debug APK: 180.5 MB
  Location: .\mobile\platforms\android\app\build\outputs\apk\debug\app-debug.apk
APK ready for installation on Android devices!
```

---

### Manual Method (If script fails)

```powershell
# Go to mobile directory
Set-Location "D:\bulgarche\bulgarche 4.0 - Copy-new original\mobile"

# Clean old build
Remove-Item .\www -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .\platforms -Recurse -Force -ErrorAction SilentlyContinue

# Copy files
Copy-Item ..\public\* -Destination .\www -Recurse -Force
Copy-Item ..\txt\* -Destination .\www -Force
Copy-Item ..\audiofiles -Destination .\www\audiofiles -Recurse -Force

# Add Android platform
cordova platform add android

# Build APK
cordova build android --release

# OR debug build (faster)
cordova build android
```

**The APK will be in:**
- Debug: `mobile\platforms\android\app\build\outputs\apk\debug\app-debug.apk`
- Release: `mobile\platforms\android\app\build\outputs\apk\release\app-release.apk`

---

## 📱 STEP 3: Install on Android Phone

### Option A: Using ADB (Fastest)

**1. Enable Developer Mode on Phone:**
- Go to: Settings → About Phone
- Find "Build Number"
- Tap it 7 times
- Back to Settings → Developer Options
- Turn on "USB Debugging"

**2. Connect Phone to Computer with USB Cable**

**3. In PowerShell:**
```powershell
# List connected devices
adb devices

# You should see your phone listed
# Example output:
# List of attached devices
# RF8M90ABCDE    device

# Install APK
cd "D:\bulgarche\bulgarche 4.0 - Copy-new original\mobile\platforms\android\app\build\outputs\apk\debug"
adb install -r app-debug.apk

# Wait for: Success
```

**Done!** The app is now on your phone.

---

### Option B: Manual Installation (Simpler)

**1. Copy APK to Phone:**
- Connect phone via USB
- Copy `app-debug.apk` to phone's Downloads folder
- Disconnect USB

**2. On Your Phone:**
- Open File Manager
- Go to Downloads
- Tap `app-debug.apk`
- Tap "Install"
- Allow permissions if prompted
- Wait for installation to complete

**Done!** The app is now on your phone.

---

### Option C: Email/Cloud Transfer

**1. Copy APK File:**
```powershell
Copy-Item "D:\bulgarche\bulgarche 4.0 - Copy-new original\mobile\platforms\android\app\build\outputs\apk\debug\app-debug.apk" -Destination "C:\Users\hrist\Desktop"
```

**2. Share the file:**
- Email it to yourself
- Upload to Google Drive
- Use WhatsApp, Telegram, etc.

**3. On Phone:**
- Download the APK
- Open Downloads folder
- Tap the APK file
- Tap Install

---

## 🚀 RUNNING THE APP

Once installed on your phone:

1. **Find the app:**
   - Look for "Bulgarche" icon in your apps
   - Or go to: Settings → Apps → Bulgarche

2. **Tap to open:**
   - The app will start
   - Disclaimer screen appears
   - Accept to continue

3. **First run:**
   - Tutorial appears (you can skip)
   - Home screen loads
   - Start learning!

---

## 📊 App Features

Once running, you'll see:

**🏠 Home:**
- Progress statistics
- Streak counter
- Quick access buttons

**📚 Lessons:**
- 32 interactive lessons
- Read and track progress
- Bulgarian and French content

**✏️ Tests:**
- Comprehensive quizzes
- Multiple choice questions
- Immediate feedback
- Score tracking

**📖 Dictionary:**
- 443 Bulgarian words
- Audio pronunciation
- English/French translations
- Search functionality

**🎮 Games:**
- Vocabulary games
- Memory matching
- Educational activities
- Score tracking

**🏆 Achievements:**
- Progress badges
- Learning streaks
- Statistics dashboard

**⚙️ Settings:**
- Theme selection
- Language preferences
- Progress export/import

---

## ❌ Troubleshooting

### "APK build failed"
**Solutions:**
1. Verify Android SDK is installed: `echo $env:ANDROID_HOME`
2. Verify Java is installed: `java -version`
3. Try manual build (see Step 2 Manual Method)
4. Close all Java processes and retry

### "Command cordova not found"
**Solution:**
```powershell
npm install -g cordova
# Restart PowerShell
cordova --version
```

### "adb command not found"
**Solution:**
1. Ensure Android SDK is in PATH
2. Or use full path: `C:\Android\sdk\platform-tools\adb.exe devices`

### "Installation fails on phone"
**Solutions:**
1. Check "Unknown sources" is allowed: Settings → Security
2. Uninstall old version first
3. Try different APK (debug vs release)
4. Restart phone

### "App crashes on startup"
**Solutions:**
1. Check phone has space (need ~200MB)
2. Check phone Android version is 5.0+ (API 21+)
3. Uninstall and reinstall
4. Check console logs: `adb logcat`

### "Audio files not working"
**Solutions:**
1. Check files copied to mobile/www/audiofiles
2. Clear app cache: Settings → Apps → Bulgarche → Storage → Clear Cache
3. Reinstall APK

---

## 🎯 Best Practices

✅ **DO:**
- Build debug APK first (faster, easier to test)
- Test on multiple phones if possible
- Clear cache between reinstalls
- Keep phone plugged in during build/install

❌ **DON'T:**
- Build release APK for testing (takes 2x longer)
- Unplug phone during installation
- Close PowerShell during build
- Delete mobile/www while building

---

## 📞 Quick Commands Reference

```powershell
# Check prerequisites
java -version
cordova --version
echo $env:ANDROID_HOME

# Build APK
cd D:\bulgarche\bulgarche 4.0 - Copy-new original
.\BUILD-APK-WORKING.ps1

# List connected devices
adb devices

# Install APK
adb install -r app-debug.apk

# View app logs
adb logcat | findstr "bulgarche"

# Uninstall from phone
adb uninstall com.bulgarche.bulgarche

# Clear app data
adb shell pm clear com.bulgarche.bulgarche
```

---

## ✨ You're Ready!

Follow these steps in order and you'll have the APK built and running in 30 minutes!

**Summary:**
1. Install Java, Android SDK (15 min)
2. Set environment variables (5 min)
3. Run build script (10 min)
4. Install on phone (5 min)
5. Open app and enjoy! 🎉

---

**Questions?** Check BUILD_GUIDE.md for more detailed information.

Good luck! 🚀