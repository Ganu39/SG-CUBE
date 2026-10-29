$ws = New-Object -ComObject WScript.Shell
$desk = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desk "SG CUBE.lnk"
$scriptDir = Split-Path -Parent $PSScriptRoot
$exePath = Join-Path $scriptDir "SG-CUBE.exe"
$iconPath = Join-Path $scriptDir "assets\SG-CUBE.ico"

$s = $ws.CreateShortcut($shortcutPath)
$s.TargetPath = $exePath
$s.WorkingDirectory = $scriptDir
if (Test-Path $iconPath) {
    $s.IconLocation = "$iconPath,0"
}
$s.Description = "SG CUBE - Voice-First AI and Assistive Companion"
$s.Save()

Write-Host "Desktop shortcut created successfully at: $shortcutPath"
Write-Host "Target: $exePath"
