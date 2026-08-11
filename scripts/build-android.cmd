@echo off
REM ============================================================
REM   Pakistan MCQs Hub - Android APK build (TWA / Bubblewrap)
REM   Requirements:
REM   - Node.js + npm
REM   - Java 11+ with keytool on PATH
REM   - Android SDK (ANDROID_HOME set) for the Gradle step
REM   - Bubblewrap: npm i -g @bubblewrap/cli
REM   Usage:   scripts\build-android.cmd
REM ============================================================
setlocal
cd /d "%~dp0\.."

echo [1/5] Checking environment...
where node >nul 2>nul || ( echo Node.js not found. & exit /b 1 )

echo [2/5] Generating signing keystore (if missing)...
if not exist "android\key.keystore" (
  keytool -genkeypair -v -keystore "android\key.keystore" -alias pmh ^
    -keyalg RSA -keysize 2048 -validity 10000 ^
    -storepass pmh2026 -keypass pmh2026 -dname "CN=PMH, OU=Apps, O=Pakistan MCQs Hub, C=PK" 2>nul
  if errorlevel 1 echo Warning: keytool not available - place your own keystore at android\key.keystore.
)

echo [3/4] Initializing TWA project + building APK...
cd android
npx -y @bubblewrap/cli@latest init --manifest twa-manifest.json
if errorlevel 1 ( echo Bubblewrap init failed - install Android SDK / bubblewrap. & exit /b 1 )
npx -y @bubblewrap/cli@latest build --skipUpgrade
cd ..
if errorlevel 1 ( echo APK build failed. & exit /b 1 )

echo ============================================================
echo   DONE. APK artifacts in android\twa\app\build\outputs\apk
echo   Upload the build-bundle to the Play Console, or sideload.
echo ============================================================
endlocal
