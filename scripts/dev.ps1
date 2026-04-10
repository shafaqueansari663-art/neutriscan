# Run:  powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "Set-Location '$root\backend'; .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
) | Out-Null
Start-Sleep -Seconds 2
Set-Location "$root\frontend"
npm run dev -- --host 127.0.0.1
