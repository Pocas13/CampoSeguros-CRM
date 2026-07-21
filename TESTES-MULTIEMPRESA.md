# Teste de isolamento multiempresa

1. Entre como `admin@insureflow.pt` e crie um cliente com nome `CLIENTE EMPRESA 1`.
2. Termine sessão.
3. Entre como `admin2@insureflow.pt`.
4. Confirme que `CLIENTE EMPRESA 1` não aparece.
5. Crie `CLIENTE EMPRESA 2` e confirme o inverso ao regressar à empresa 1.
6. Entre como `platform@insureflow.pt`: deve ver mediadoras e limites, mas não a carteira operacional de cada uma.
7. Na empresa 1, retire a um utilizador a permissão financeira e confirme que não vê prémios nem comissões globais.
8. Em Integrações, execute a importação demo. Os registos devem entrar apenas na mediadora autenticada.
