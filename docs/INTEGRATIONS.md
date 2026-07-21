# Integrações de seguradoras

## Importação direta de carteira

É possível importar clientes e apólices diretamente quando a seguradora disponibiliza um endpoint oficial de carteira ao mediador. A companhia terá de fornecer documentação, autenticação, ambiente de testes e autorização contratual.

Fluxo:

1. Administrador da mediadora configura código de agente e credenciais.
2. InsureFlow testa a ligação sem mostrar o segredo ao navegador.
3. O conector lê a carteira da seguradora.
4. Os dados são normalizados para Cliente e Apólice.
5. Duplicados são identificados dentro da mediadora.
6. É criado um relatório de importados, ignorados e falhas.

Sem endpoint de carteira, podem ser usados CSV/XLSX/XML/JSON ou introdução assistida. A existência de um simulador web não implica acesso a uma API de carteira.
