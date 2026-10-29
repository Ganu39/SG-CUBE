@echo off
title SG CUBE 2.5 Background Wake Listener
cd /d "%~dp0"

if exist "%~dp0SG-CUBE-Wake-Listener.exe" (
    start "" "%~dp0SG-CUBE-Wake-Listener.exe" %*
    exit /b 0
)

if exist "%~dp0runtime\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0runtime\Scripts\python.exe"
) else if exist "%~dp0runtime\python.exe" (
    set "PYTHON_EXE=%~dp0runtime\python.exe"
) else if exist "%~dp0.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0.venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

"%PYTHON_EXE%" wake_listener.py
