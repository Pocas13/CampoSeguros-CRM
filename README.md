# InsureFlow 2.5

Plataforma privada multiempresa para mediadores de seguros. Cada mediadora tem utilizadores, clientes, cotações, apólices, sinistros, agenda, integrações e auditoria isolados.

## Arquitetura multiempresa

- `Company` representa internamente a **mediadora/organização**, não uma seguradora.
- `Insurer` representa a companhia de seguros.
- Todos os registos privados usam `companyId`, obtido pela sessão autenticada.
- O frontend nunca escolhe livremente a organização.
- Uma segunda mediadora de demonstração permite confirmar que os dados não se misturam.

## Perfis e permissões

- **Super administrador da plataforma**: cria, limita, ativa ou suspende mediadoras.
- **Administrador da mediadora**: gere empresa, utilizadores, permissões, integrações e carteira.
- **Gestor**: visão operacional e financeira, conforme permissões.
- **Utilizador**: clientes, cotações, apólices, sinistros e agenda, sem totais financeiros por defeito.

As permissões podem ser acrescentadas individualmente: comissões, carteira total, utilizadores, integrações, importação, auditoria, eliminações, exportações e processos da equipa.

## Integrações e importação de carteira

O conector técnico é criado uma vez por companhia. Cada mediadora guarda separadamente o seu código de agente, utilizador técnico, token, certificado ou configuração. Os segredos são cifrados no backend.

A importação direta de carteira por API ou webservice já tem o processo e a base de dados preparados. Um conector real só pode ser ativado quando a seguradora fornecer documentação, credenciais e endpoints autorizados de carteira. Mantêm-se alternativas por ficheiro e registo assistido.

## Módulos

Dashboard, clientes, cotações, comparador, apólices, sinistros, agenda, companhias, pesquisa global, utilizadores, integrações, importações, auditoria, configuração e administração da plataforma.

A pesquisa global responde enquanto o utilizador escreve e localiza clientes, NIF, apólices, sinistros e cotações sem sair da página atual. O diretório de cada companhia contém contactos privados da mediadora para comercial, linha de agentes, sinistros e assistência.

## Atualização

Execute `ATUALIZAR.ps1`. A migração é incremental e não utiliza `prisma migrate reset`.
