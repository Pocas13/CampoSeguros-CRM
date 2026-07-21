$ErrorActionPreference = "Continue"
$PSNativeCommandUseErrorActionPreference = $false

Write-Host "InsureFlow - correção da base de dados e do dashboard" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$schema = Join-Path $backend "prisma\schema.prisma"
$repairSql = Join-Path $backend "prisma\hotfixes\20260721_repair_insurers_clients_policies.sql"

Push-Location $backend

Write-Host "1/6 - Instalar dependências do backend..." -ForegroundColor Yellow
npm install

Write-Host "2/6 - Reparar a estrutura no Neon..." -ForegroundColor Yellow
npx prisma db execute --file="$repairSql" --schema="$schema"

Write-Host "3/6 - Resolver a migração anterior, caso tenha ficado falhada..." -ForegroundColor Yellow
npx prisma migrate resolve --applied 20260721010000_insurers_clients_policies --schema="$schema" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "A migração já estava resolvida ou aplicada. A continuar." -ForegroundColor DarkYellow
}

Write-Host "4/6 - Gerar Prisma Client..." -ForegroundColor Yellow
npx prisma generate --schema="$schema"

Write-Host "5/6 - Compilar backend..." -ForegroundColor Yellow
npm run build

Pop-Location
Push-Location $frontend

Write-Host "6/6 - Instalar e compilar frontend..." -ForegroundColor Yellow
npm install
npm run build

Pop-Location

Write-Host "Correção concluída." -ForegroundColor Green
Write-Host "Inicie o backend e o frontend em terminais separados." -ForegroundColor Green
