@echo off
echo Starting local server for PetTopia...
echo Server running at: http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
python -m http.server 8080
