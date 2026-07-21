chcp 65001 > $null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Continue"
$PSNativeCommandUseErrorActionPreference = $false

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$envFile = Join-Path $backend ".env"

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " INSUREFLOW 2.5 - PESQUISA, DIRETORIO E SINISTROS" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Atualizacao incremental: nao apaga clientes, apolices ou configuracoes existentes." -ForegroundColor Yellow

if (-not (Test-Path $envFile)) {
  Write-Host "ERRO: falta D:\InsureFlow\backend\.env com DATABASE_URL e DIRECT_URL do Neon." -ForegroundColor Red
  exit 1
}

$envContent = Get-Content $envFile -Raw
if ($envContent -notmatch "(?m)^INTEGRATION_ENCRYPTION_KEY=") {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  $key = [Convert]::ToBase64String($bytes)
  Add-Content $envFile "`nINTEGRATION_ENCRYPTION_KEY=`"$key`""
  Write-Host "Criada chave local para cifrar credenciais das seguradoras." -ForegroundColor Green
}

Write-Host "[1/9] Dependencias do backend..." -ForegroundColor Yellow
Push-Location $backend
npm install
if ($LASTEXITCODE -ne 0) { throw "Falha no npm install do backend." }

Write-Host "[2/9] Validar schema Prisma..." -ForegroundColor Yellow
npx prisma validate --schema=prisma/schema.prisma
if ($LASTEXITCODE -ne 0) { throw "Schema Prisma invalido." }

Write-Host "[3/9] Gerar Prisma Client..." -ForegroundColor Yellow
npx prisma generate --schema=prisma/schema.prisma
if ($LASTEXITCODE -ne 0) { throw "Falha ao gerar Prisma Client." }

Write-Host "[4/9] Aplicar migracoes incrementais no Neon..." -ForegroundColor Yellow
npx prisma migrate deploy --schema=prisma/schema.prisma
if ($LASTEXITCODE -ne 0) { throw "Falha ao aplicar migracoes. Nao execute migrate reset." }

Write-Host "[5/9] Atualizar dados de demonstracao, sem duplicar..." -ForegroundColor Yellow
npm run seed:demo
if ($LASTEXITCODE -ne 0) { throw "Falha ao carregar dados demo." }

Write-Host "[6/9] Compilar backend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Falha no build do backend." }
Pop-Location

Write-Host "[7/9] Dependencias do frontend..." -ForegroundColor Yellow
Push-Location $frontend
npm install
if ($LASTEXITCODE -ne 0) { throw "Falha no npm install do frontend." }

Write-Host "[8/9] Limpar cache e compilar frontend..." -ForegroundColor Yellow
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
npm run build
if ($LASTEXITCODE -ne 0) { throw "Falha no build do frontend." }
Pop-Location

Write-Host "[9/9] Atualizacao concluida." -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar:" -ForegroundColor Cyan
Write-Host "  Terminal 1: cd D:\InsureFlow\backend  ; npm run start:dev"
Write-Host "  Terminal 2: cd D:\InsureFlow\frontend ; npm run dev"
Write-Host "  Abrir: http://localhost:3000/login"
Write-Host ""
Write-Host "Acessos de teste:" -ForegroundColor Cyan
Write-Host "  Plataforma: platform@insureflow.pt / InsureFlow2026!"
Write-Host "  Admin empresa 1: admin@insureflow.pt / InsureFlow2026!"
Write-Host "  Utilizador: utilizador@insureflow.pt / InsureFlow2026!"
Write-Host "  Admin empresa 2: admin2@insureflow.pt / InsureFlow2026!"
Write-Host "Altere as palavras-passe antes de usar dados reais." -ForegroundColor Yellow
