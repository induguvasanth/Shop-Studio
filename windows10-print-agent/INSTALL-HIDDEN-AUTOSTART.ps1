$ErrorActionPreference = 'Stop'
$folder = Split-Path -Parent $MyInvocation.MyCommand.Path
foreach ($file in @('agent.py','START-AGENT-HIDDEN.vbs','START-AGENT-BACKGROUND.cmd','config.json')) {
 if (!(Test-Path (Join-Path $folder $file))) { throw "Missing $file in $folder" }
}
$startup = [Environment]::GetFolderPath('Startup')
$linkPath = Join-Path $startup 'Shop Studio Print Agent.lnk'
$shell = New-Object -ComObject WScript.Shell
$link = $shell.CreateShortcut($linkPath)
$link.TargetPath = Join-Path $env:WINDIR 'System32\wscript.exe'
$link.Arguments = '"' + (Join-Path $folder 'START-AGENT-HIDDEN.vbs') + '"'
$link.WorkingDirectory = $folder
$link.Description = 'Shop Studio hidden background print agent'
$link.WindowStyle = 7
$link.Save()
Write-Host 'Hidden automatic startup installed successfully.'
Write-Host ('Startup shortcut: ' + $linkPath)
Write-Host ('Logs: ' + (Join-Path $folder 'logs\print-agent.log'))
Write-Host 'Updates to agent.py in this folder do not require installing again.'
