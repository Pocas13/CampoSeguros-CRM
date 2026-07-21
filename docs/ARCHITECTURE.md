# Arquitetura multiempresa

## Separação

A tabela `Company` é a organização mediadora. As seguradoras vivem no catálogo `Insurer`. Cada pedido autenticado recebe `userId`, `companyId`, função e permissões do token, confirmado novamente na base de dados pelo guard de autenticação.

Todos os serviços privados filtram por `companyId`. Números comerciais como NIF do cliente, número de apólice, número de sinistro e referência de cotação são únicos dentro de cada mediadora.

## Níveis

1. Plataforma InsureFlow: super administrador e gestão das mediadoras.
2. Mediadora: administrador, gestores e colaboradores.
3. Companhia: catálogo global mais configuração comercial e técnica por mediadora.

## Integrações

`InsurerIntegration` guarda o modo, ambiente, capacidades e credenciais cifradas por organização e companhia. Um conector implementa teste, cotação e/ou leitura de carteira. O código do conector é comum; credenciais e código de agente são separados por mediadora.

## Segurança

- Sessões em cookies HttpOnly.
- Segredos cifrados com AES-256-GCM.
- Permissões verificadas no backend.
- Auditoria das alterações.
- Organizações suspensas deixam de aceder.
- Nenhum `companyId` enviado pelo frontend é usado para decidir a organização ativa.
