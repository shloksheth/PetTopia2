# Simple HTTP server for PetTopia Phaser game
# Runs on port 8080 to match launch.json configuration

Write-Host "Starting local server for PetTopia..." -ForegroundColor Green
Write-Host "Server running at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

cd $PSScriptRoot
python -m http.server 8080
