@echo off
title Create SG CUBE Desktop Shortcut
setlocal enabledelayedexpansion

echo ============================================================
echo      SG CUBE — Desktop Shortcut Installer
echo ============================================================
echo.

cd /d "%~dp0"

REM Ensure SG-CUBE.exe exists
if not exist "%~dp0SG-CUBE.exe" (
    echo [INFO] SG-CUBE.exe not found. Building desktop launcher now...
    call "%~dp0build_desktop_app.bat"
)

if not exist "%~dp0SG-CUBE.exe" (
    echo [ERROR] SG-CUBE.exe could not be built.
    pause
    exit /b 1
)

echo Creating Windows desktop shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launcher\create_shortcut.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create desktop shortcut.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ============================================================
echo   Desktop shortcut is ready!
echo   You can now launch SG CUBE directly from your Desktop.
echo ============================================================
echo.
pause
