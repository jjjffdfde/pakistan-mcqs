@echo off
REM ============================================================
REM   Pakistan MCQs Hub - Windows desktop build (NSIS + portable)
REM   Requires: Node.js + npm (electron / electron-builder)
REM   Usage:   scripts\build-windows.cmd
REM ============================================================
setlocal
cd /d "%~dp0\.."
if not exist desktop\node_modules (
  echo [1/3] Installing desktop dependencies...
  cd desktop
  call npm install --no-audit --no-fund >nul
  if errorlevel 1 ( echo npm install FAILED - check network permissions. & exit /b 1 )
  cd ..
)
echo [2/3] Building NSIS installer + portable EXE...
cd desktop
call npm run dist
cd ..
if errorlevel 1 ( echo Build failed. & exit /b 1 )
echo [3/3] Done. Artifacts in desktop\release\
endlocal
