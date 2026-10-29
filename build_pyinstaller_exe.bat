@echo off
title Build Standalone SG CUBE Desktop Executable with PyInstaller
setlocal enabledelayedexpansion

echo ============================================================
echo   SG CUBE — PyInstaller Standalone Executable Builder
echo ============================================================
echo.

cd /d "%~dp0"

REM Find python in .venv
if exist "%~dp0.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0.venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

echo [1/3] Checking PyInstaller...
"%PYTHON_EXE%" -c "import PyInstaller" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installing PyInstaller into environment...
    "%PYTHON_EXE%" -m pip install pyinstaller
)

echo.
echo [2/3] Building standalone executable using sg_cube.spec...
echo (This may take 2-4 minutes to bundle PyTorch, OpenCV, WebView2, and 3D assets...)
"%PYTHON_EXE%" -m PyInstaller --clean --noconfirm sg_cube.spec

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] PyInstaller build failed with exit code %ERRORLEVEL%.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Creating output shortcut on Desktop...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ws = New-Object -ComObject WScript.Shell; " ^
    "$desk = [System.Environment]::GetFolderPath('Desktop'); " ^
    "$s = $ws.CreateShortcut((Join-Path $desk 'SG CUBE Standalone.lnk')); " ^
    "$s.TargetPath = (Join-Path '%~dp0dist' 'SG-CUBE-Desktop.exe'); " ^
    "$s.WorkingDirectory = '%~dp0dist'; " ^
    "$s.IconLocation = (Join-Path '%~dp0assets' 'SG-CUBE.ico') + ',0'; " ^
    "$s.Description = 'SG CUBE Standalone Desktop App'; " ^
    "$s.Save(); " ^
    "Write-Host '[OK] Standalone shortcut created on Desktop!'"

echo.
echo ============================================================
echo   BUILD COMPLETED SUCCESSFULLY!
echo   Output: dist\SG-CUBE-Desktop.exe
echo ============================================================
echo.
