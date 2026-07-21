# Atualizar o InsureFlow 2.2

## 1. Parar o projeto

Nos terminais do frontend e backend, prima `Ctrl + C`.

## 2. Fazer cópia de segurança

```powershell
Copy-Item "D:\InsureFlow" "D:\InsureFlow-backup-2.2" -Recurse
```

## 3. Copiar a atualização

Extraia `InsureFlow.zip` diretamente para `D:\` e escolha **Substituir os ficheiros no destino**.

Preserve:

- `D:\InsureFlow\backend\.env`
- `D:\InsureFlow\frontend\.env.local`

## 4. Atualizar base de dados e aplicação

```powershell
cd D:\InsureFlow
powershell -ExecutionPolicy Bypass -File ".\ATUALIZAR.ps1"
```

O processo executa:

- instalação das dependências;
- validação e geração do Prisma Client;
- migrações incrementais no Neon;
- criação idempotente dos acessos e dados de demonstração;
- build do backend e frontend.

Não executa `prisma migrate reset`.

## 5. Iniciar

```powershell
cd D:\InsureFlow
powershell -ExecutionPolicy Bypass -File ".\INICIAR.ps1"
```

Ou em dois terminais:

```powershell
cd D:\InsureFlow\backend
npm run start:dev
```

```powershell
cd D:\InsureFlow\frontend
npm run dev
```

## 6. Entrar

Abra `http://localhost:3000/login`.

Acessos de teste:

| Nível | Email | Palavra-passe |
|---|---|---|
| Administrador | `admin@insureflow.pt` | `InsureFlow2026!` |
| Utilizador | `utilizador@insureflow.pt` | `InsureFlow2026!` |

Altere as palavras-passe em **Configuração** antes de usar dados reais.

## Comportamento esperado

### Administrador
- Vê os indicadores financeiros do dashboard.
- Gere utilizadores e dados da mediadora.
- Atualiza companhias, contactos e ligações.
- Mantém acesso a todos os processos da empresa.

### Utilizador
- Não vê prémios globais nem comissões totais.
- Gere o próprio perfil e palavra-passe.
- Trabalha clientes, cotações, apólices e sinistros.
- Vê no dashboard e agenda as tarefas que lhe estão atribuídas.

## Endereços
- Login/CRM: `http://localhost:3000`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api`

## Privacidade do acesso

Após esta atualização, a única página pública do frontend é `/login`. Qualquer tentativa de abrir diretamente o dashboard, clientes, cotações, apólices, agenda, companhias, utilizadores ou configurações é redirecionada antes de a página privada ser renderizada.

As sessões antigas guardadas pelo navegador deixam de ser usadas. Depois da atualização, inicie sessão novamente para criar os novos cookies de sessão protegidos.

## Atualização 2.3

Esta atualização não cria nem elimina tabelas. Mantém os dados existentes no Neon.

Depois de substituir os ficheiros:

```powershell
cd D:\InsureFlow
powershell -ExecutionPolicy Bypass -File ".\ATUALIZAR.ps1"
```

Para testar a identificação de veículos, use as matrículas `12-AB-34`, `AA-00-AA` e `34-CD-56`.
