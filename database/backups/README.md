# Backups de Banco de Dados

Este diretório deve conter scripts e arquivos de backup do PostgreSQL.

Exemplo de comando para exportar um backup:

```bash
pg_dump -U insureflow -h localhost -d insureflow -F c -f ./database/backups/insureflow_backup.dump
```

Para restaurar:

```bash
pg_restore -U insureflow -h localhost -d insureflow ./database/backups/insureflow_backup.dump
```
