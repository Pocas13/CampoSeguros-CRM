<#
.SYNOPSIS
  Executa migrações do banco de dados.
#>

Write-Host "Executando migrações do backend..."
cd "$(Resolve-Path ..\backend)"
npx prisma migrate dev
