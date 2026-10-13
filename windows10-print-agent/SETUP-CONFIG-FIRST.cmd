@echo off
cd /d "%~dp0"
if exist "config.json" (
 echo config.json already exists; leaving it unchanged.
) else (
 copy "config.example.json" "config.json" >nul
 echo Created config.json from example. EDIT IT BEFORE STARTING.
)
notepad "config.json"
echo After saving, test manually with python agent.py before installing autostart.
pause
