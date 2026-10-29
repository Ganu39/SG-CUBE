@echo off
title Build SG CUBE Desktop App Executable
setlocal enabledelayedexpansion

echo ============================================================
echo      SG CUBE — Native Desktop Executable Builder
echo ============================================================
echo.

cd /d "%~dp0"

REM Find csc.exe - Microsoft C# Compiler built into Windows
set "CSC_EXE="
if exist "%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe" (
    set "CSC_EXE=%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
) else if exist "%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\csc.exe" (
    set "CSC_EXE=%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)

if "%CSC_EXE%"=="" (
    echo [ERROR] Microsoft .NET Framework C# compiler csc.exe not found.
    pause
    exit /b 1
)

echo [1/2] Compiling SG-CUBE.exe - Main Desktop App Launcher...
"%CSC_EXE%" /target:winexe /optimize+ /win32icon:"assets\SG-CUBE.ico" /out:"SG-CUBE.exe" /r:System.dll,System.Windows.Forms.dll,System.Drawing.dll "launcher\SGCubeLauncher.cs" "launcher\AssemblyInfo.cs"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to compile SG-CUBE.exe.
    pause
    exit /b %ERRORLEVEL%
)
echo [OK] SG-CUBE.exe compiled successfully!

echo.
echo [2/2] Compiling SG-CUBE-Wake-Listener.exe - Background Tray Listener...
"%CSC_EXE%" /target:winexe /optimize+ /win32icon:"assets\SG-CUBE.ico" /out:"SG-CUBE-Wake-Listener.exe" /r:System.dll,System.Windows.Forms.dll,System.Drawing.dll "launcher\SGCubeWakeLauncher.cs" "launcher\AssemblyInfo.cs"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to compile SG-CUBE-Wake-Listener.exe.
    pause
    exit /b %ERRORLEVEL%
)
echo [OK] SG-CUBE-Wake-Listener.exe compiled successfully!

echo.
echo ============================================================
echo   Desktop executables built successfully!
echo   - SG-CUBE.exe silent native Windows launcher
echo   - SG-CUBE-Wake-Listener.exe background listener
echo ============================================================
echo.
