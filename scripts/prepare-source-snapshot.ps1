$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
$artifactRoot = Join-Path $projectRoot 'release-artifacts'
New-Item -ItemType Directory -Path $artifactRoot -Force | Out-Null
$archivePath = Join-Path $artifactRoot ("portfolio-v{0}-source-{1}.zip" -f $package.version, (Get-Date -Format 'yyyyMMdd-HHmmss'))
$sourcePaths = @(& git -C $projectRoot ls-files --cached --others --exclude-standard) | Sort-Object -Unique
if ($LASTEXITCODE -ne 0) { throw 'Unable to enumerate repository source.' }
Add-Type -AssemblyName System.IO.Compression
$stream = [IO.File]::Open($archivePath, [IO.FileMode]::CreateNew)
$archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create)
$count = 0
try {
  foreach ($relative in $sourcePaths) {
    if ($relative -match '^(experiments|release-artifacts|node_modules|out|\.next|\.wrangler|myphotos)/') { continue }
    if ($relative -match '(^|/)(\.env|\.dev\.vars)' -and $relative -notmatch '\.example$') { continue }
    $source = [IO.Path]::GetFullPath((Join-Path $projectRoot $relative))
    if (-not $source.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Source path escaped the project.' }
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { continue }
    $entry = $archive.CreateEntry($relative.Replace('\', '/'), [IO.Compression.CompressionLevel]::Optimal)
    $inputStream = [IO.File]::OpenRead($source)
    $outputStream = $entry.Open()
    try { $inputStream.CopyTo($outputStream) } finally { $inputStream.Dispose(); $outputStream.Dispose() }
    $count++
  }
} finally { $archive.Dispose(); $stream.Dispose() }
$hash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
[IO.File]::WriteAllText($archivePath + '.sha256', "$hash  $([IO.Path]::GetFileName($archivePath))`n")
[pscustomobject]@{ Archive = $archivePath; SourceFiles = $count; SHA256 = $hash }
