$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$public = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\public'))

function Save-Stripe {
  param([int]$Size, [string]$OutPath)
  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(15, 23, 42))
  $cols = @(
    [System.Drawing.Color]::FromArgb(225, 29, 72),
    [System.Drawing.Color]::FromArgb(234, 88, 12),
    [System.Drawing.Color]::FromArgb(202, 138, 4),
    [System.Drawing.Color]::FromArgb(22, 163, 74),
    [System.Drawing.Color]::FromArgb(8, 145, 178),
    [System.Drawing.Color]::FromArgb(37, 99, 235),
    [System.Drawing.Color]::FromArgb(147, 51, 234)
  )
  $stripe = [double]$Size / 7
  for ($i = 0; $i -lt 7; $i++) {
    $b = New-Object System.Drawing.SolidBrush($cols[$i])
    $x = [int][Math]::Floor($i * $stripe)
    $w = [int][Math]::Ceiling(($i + 1) * $stripe) - $x
    $g.FillRectangle($b, $x, 0, $w, $Size)
    $b.Dispose()
  }
  $g.Dispose()
  $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

Save-Stripe -Size 180 -OutPath (Join-Path $public 'apple-touch-icon.png')
Save-Stripe -Size 192 -OutPath (Join-Path $public 'icon-192.png')
Save-Stripe -Size 512 -OutPath (Join-Path $public 'icon-512.png')
Write-Host 'Wrote nanairo stripe PNGs to' $public
