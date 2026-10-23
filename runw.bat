@echo off
title SG CUBE
cd /d "%~dp0"

if exist "%~dp0runtime\Scripts\pythonw.exe" (
    set "PYTHON_EXE=%~dp0runtime\Scripts\pythonw.exe"
) else if exist "%~dp0runtime\pythonw.exe" (
    set "PYTHON_EXE=%~dp0runtime\pythonw.exe"
) else if exist "%~dp0.venv\Scripts\pythonw.exe" (
    set "PYTHON_EXE=%~dp0.venv\Scripts\pythonw.exe"
) else (
    set "PYTHON_EXE=pythonw"
)

start "" "%PYTHON_EXE%" visionclaw_gui.py %*
