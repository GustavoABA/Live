$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host ''
Write-Host 'NihilGuh Overlay Compositor' -ForegroundColor Magenta
Write-Host '==========================' -ForegroundColor DarkMagenta
Write-Host ''

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host 'Node.js nao encontrado no PATH.' -ForegroundColor Red
    Write-Host 'Instale o Node.js LTS e rode este arquivo novamente.' -ForegroundColor Yellow
    Read-Host 'Pressione ENTER para sair'
    exit 1
}

if (-not (Test-Path (Join-Path $PSScriptRoot 'node_modules'))) {
    Write-Host 'Instalando dependencias...' -ForegroundColor Cyan
    npm install
}

Write-Host 'Garantindo Chromium do Playwright...' -ForegroundColor Cyan
npx playwright install chromium

Write-Host ''
Write-Host 'Iniciando compositor em http://127.0.0.1:8791/' -ForegroundColor Green
Write-Host 'Edite overlays.json para adicionar/remover alertboxes.' -ForegroundColor Gray
Write-Host 'Deixe esta janela aberta durante a live.' -ForegroundColor Gray
Write-Host ''

npm start
