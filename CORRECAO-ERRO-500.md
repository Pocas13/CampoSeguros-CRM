# Correção dos erros 500

Esta correção:

- completa no Neon as colunas novas de clientes;
- cria as tabelas de companhias e contactos;
- completa os campos novos das apólices;
- cria as companhias iniciais;
- regenera o Prisma Client;
- corrige o dashboard para não falhar quando a API devolve erro.

## Executar

```powershell
cd D:\InsureFlow
Set-ExecutionPolicy -Scope Process Bypass
.\ATUALIZAR-CORRECAO.ps1
```

Depois:

```powershell
cd D:\InsureFlow\backend
npm run start:dev
```

Noutro terminal:

```powershell
cd D:\InsureFlow\frontend
npm run dev
```
