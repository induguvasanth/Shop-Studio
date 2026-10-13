@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0INSTALL-HIDDEN-AUTOSTART.ps1"
if errorlevel 1 (echo Installation failed. Check the messages above.) else (echo Setup complete. Sign out and sign in to test.)
pause
