# Bulgarche APK Build Instructions

## Quick Start (Easiest Method)

1. **Double-click `build-apk-easy.bat`**
   - This will install everything needed
   - Build the APK automatically
   - Give you the final APK file

## Prerequisites

### Required Software:
1. **Node.js** - Download from https://nodejs.org/
2. **Android Studio** - Download from https://developer.android.com/studio
3. **Java JDK** - Usually comes with Android Studio

### Environment Variables (if not auto-detected):
- `ANDROID_HOME` - Path to Android SDK
- `JAVA_HOME` - Path to Java JDK

## Build Scripts

### 1. `build-apk-easy.bat` (Recommended)
- Installs Cordova automatically
- Builds debug APK
- No signing required
- Perfect for testing

### 2. `apk.bat` (Advanced)
- Checks for all prerequisites
- Builds release APK
- Optional signing with keystore
- More error checking

## Build Process

The scripts will:
1. Install Cordova if missing
2. Add Android platform
3. Build the APK
4. Copy APK to project root
5. Open file location

## Output Files

- **Debug APK**: `Bulgarche_Debug_YYYYMMDD_HHMM.apk`
- **Release APK**: `Bulgarche_v4.0_YYYYMMDD_HHMM.apk`

## Installation

1. Transfer APK to Android device
2. Enable "Install from unknown sources"
3. Tap APK file to install

## Troubleshooting

### Common Issues:
1. **"Android SDK not found"**
   - Install Android Studio
   - Set ANDROID_HOME environment variable

2. **"Java not found"**
   - Install Java JDK
   - Set JAVA_HOME environment variable

3. **"Build failed"**
   - Run as Administrator
   - Check internet connection
   - Clear node_modules and retry

### Manual Setup (if scripts fail):

```bash
# Install Cordova
npm install -g cordova

# Add Android platform
cordova platform add android

# Build APK
cordova build android
```

## APK Location
Final APK files will be in:
- `platforms\android\app\build\outputs\apk\debug\app-debug.apk`
- Copied to project root with timestamp

## Support
If build fails, check the error messages in the command prompt window.
