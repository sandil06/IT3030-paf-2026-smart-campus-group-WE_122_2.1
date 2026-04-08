# Smart Campus Operations Hub — Startup Script
Write-Host "Starting Smart Campus Operations Hub..." -ForegroundColor Cyan

# Resolve the directory where this script lives (new_smart_campus_system/)
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

# 1. Start the Spring Boot Backend in a separate window
Write-Host "Booting Spring Boot Backend (Port 9090)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$root\backend'; .\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run`"" -WindowStyle Normal

# Wait for Spring Boot to fully start before launching the frontend
Write-Host "Waiting for backend to start (20s)..." -ForegroundColor Gray
Start-Sleep -Seconds 20

# 2. Start the React Frontend in another separate window
Write-Host "Booting React Frontend (Port 3000)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$root\frontend'; npm start`"" -WindowStyle Normal

Write-Host ""
Write-Host "Both services are now starting in separate windows." -ForegroundColor Green
Write-Host "  Backend API : http://localhost:9090/api" -ForegroundColor Cyan
Write-Host "  Frontend    : http://localhost:3000" -ForegroundColor Cyan