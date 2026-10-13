@echo off
setlocal
powershell.exe -NoProfile -Command "$p=Join-Path ([Environment]::GetFolderPath('Startup')) 'Shop Studio Print Agent.lnk'; if(Test-Path $p){Remove-Item $p -Force; Write-Host 'Auto-start removed.'}else{Write-Host 'Auto-start not installed.'}"
pause
