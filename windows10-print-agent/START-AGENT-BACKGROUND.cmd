@echo off
cd /d "%~dp0"
if not exist "config.json" exit /b 2
if not exist "agent.py" exit /b 3
if not exist "logs" mkdir "logs"
:again
python -u agent.py >> "logs\print-agent.log" 2>&1
if errorlevel 1 (
  echo [%date% %time%] Agent exited. Restarting in 15 seconds. >> "logs\print-agent.log"
  timeout /t 15 /nobreak >nul
  goto again
)
