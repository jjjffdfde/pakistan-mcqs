@echo off
REM ============================================================
REM   Pakistan MCQs Hub - Full build & deploy pipeline
REM   Usage:   scripts\deploy.cmd [type]
REM     type:  site | desktop | android | release | all
REM ============================================================
setlocal
cd /d "%~dp0\.."

if "%1"=="site"   goto site
if "%1"=="desktop" goto desktop
if "%1"=="android" goto android
if "%1"=="release" goto release
if "%1"=="all" goto all
goto usage

:site
  echo === [1/2] Regenerating static SEO pages + sitemap ===
  node scripts\gen-seo-pages.cjs
  echo === [2/2] Regenerating PWA assets ===
  node scripts\gen-pwa-assets.cjs
  echo Site ready for GitHub Pages push.
  goto end

:desktop
  call scripts\build-windows.cmd
  goto end

:android
  call scripts\build-android.cmd
  goto end

:release
  echo === Building release artifacts ===
  node scripts\gen-pwa-assets.cjs
  node scripts\gen-seo-pages.cjs
  node scripts\phase25-platform.cjs
  del /q release\* 2>nul
  mkdir release 2>nul
  echo Phase 25 report -> docs\PHASE25_EXECUTION_REPORT.md
  goto end

:all
  call scripts\deploy.cmd site
  call scripts\deploy.cmd desktop
  call scripts\deploy.cmd android
  call scripts\deploy.cmd release
  goto end

:usage
  echo Usage: deploy.cmd site ^| desktop ^| android ^| release ^| all
  goto end

:end
endlocal
