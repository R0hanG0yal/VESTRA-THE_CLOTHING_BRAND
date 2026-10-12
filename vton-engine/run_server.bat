@echo off
title FASHN VTON v1.5 API Engine
echo ===================================================
echo   Starting FASHN VTON v1.5 Inference Server
echo   Engine: Maskless Virtual Try-On in Pixel Space
echo ===================================================

cd /d "%~dp0"

IF NOT EXIST ".venv\Scripts\python.exe" (
    echo [INFO] Creating Python virtual environment...
    py -3.11 -m venv .venv
    echo [INFO] Installing dependencies...
    .venv\Scripts\python.exe -m pip install -e .
    .venv\Scripts\python.exe -m pip install fastapi uvicorn pydantic pillow numpy requests python-multipart
)

echo [INFO] Launching FASHN VTON API Server on http://127.0.0.1:8000
.venv\Scripts\python.exe api_server.py
pause
