param(
    [string]$ImagePath = (Join-Path $PSScriptRoot "..\tam soat ung thu vu.png"),
    [string]$SubtitlePath = (Join-Path $PSScriptRoot "breast-screening.ass"),
    [string]$OutputPath = (Join-Path $PSScriptRoot "output\breast-screening-9x16.mp4"),
    [int]$FrameRate = 25,
    [int]$DurationSeconds = 15
)

$ffmpeg = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -like "*Gyan.FFmpeg*" } |
    Select-Object -First 1

if (-not $ffmpeg) {
    throw "FFmpeg executable not found."
}

if (-not (Test-Path $ImagePath)) {
    throw "Input image not found: $ImagePath"
}

if (-not (Test-Path $SubtitlePath)) {
    throw "Subtitle file not found: $SubtitlePath"
}

$outputDir = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$frameCount = $FrameRate * $DurationSeconds
$filter = "zoompan=z='min(zoom+0.00045,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frameCount}:s=1080x1920:fps=${FrameRate},subtitles='breast-screening.ass',format=yuv420p"

Push-Location $PSScriptRoot
try {
    & $ffmpeg.FullName `
        -y `
        -loop 1 `
        -i $ImagePath `
        -vf $filter `
        -frames:v $frameCount `
        -c:v libx264 `
        -preset medium `
        -crf 18 `
        -pix_fmt yuv420p `
        -movflags +faststart `
        -an `
        $OutputPath
}
finally {
    Pop-Location
}
