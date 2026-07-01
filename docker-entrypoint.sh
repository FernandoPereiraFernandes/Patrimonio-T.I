#!/bin/bash
# Script de entrada do container - roda migrations antes de iniciar
set -e

echo "[$(date)] PatrimônioTI - Iniciando container..."

# Aguardar banco de dados estar disponível (se DATABASE_URL estiver definida)
if [ -n "$DATABASE_URL" ]; then
    echo "[$(date)] Aguardando banco de dados..."
    for i in $(seq 1 30); do
        if node -e "
            const mysql = require('mysql2/promise');
            const url = new URL(process.env.DATABASE_URL);
            (async () => {
                try {
                    const conn = await mysql.createConnection({
                        host: url.hostname,
                        port: url.port || 3306,
                        user: url.username,
                        password: decodeURIComponent(url.password),
                        connectTimeout: 3000
                    });
                    await conn.end();
                    process.exit(0);
                } catch (e) {
                    process.exit(1);
                }
            })();
        " 2>/dev/null; then
            echo "[$(date)] Banco de dados acessível."
            break
        fi
        echo "[$(date)] Tentativa $i/30 - aguardando banco..."
        sleep 2
    done

    # Aplicar schema (cria tabelas se não existirem)
    echo "[$(date)] Aplicando schema do banco..."
    npx prisma db push --accept-data-loss 2>&1 || echo "Aviso: prisma db push falhou (talvez já esteja em dia)"
fi

echo "[$(date)] Iniciando servidor Next.js..."
exec "$@"
