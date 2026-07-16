<#
.SYNOPSIS
  Script de instalação inicial do InsureFlow.
.DESCRIPTION
  Instala dependências e configura o projeto local.
#>

Write-Host "Instalando dependências do frontend..."
pm install --prefix "$(Resolve-Path ..\frontend)"

Write-Host "Instalando dependências do backend..."
pm install --prefix "$(Resolve-Path ..\backend)"

Write-Host "Instalações concluídas."
