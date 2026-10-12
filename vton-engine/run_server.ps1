# PowerShell script to run FASHN VTON v1.5 API Engine
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting FASHN VTON v1.5 Inference Server" -ForegroundColor Cyan
Write-Host "  Engine: Maskless Virtual Try-On in Pixel Space" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Host "[INFO] Initializing Python 3.11 virtual environment..." -ForegroundColor Yellow
    py -3.11 -m venv .venv
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
    .\.venv\Scripts\python.exe -m pip install -e .
    .\.venv\Scripts\python.exe -m pip install fastapi uvicorn pydantic pillow numpy requests python-multipart
}

Write-Host "[INFO] Launching FASHN VTON API Server on http://127.0.0.1:8000" -ForegroundColor Green
.\.venv\Scripts\python.exe api_server.py
