#!/bin/bash
# Mantém o dev server rodando, reiniciando se morrer
cd /home/z/my-project
while true; do
  echo "[$(date)] Iniciando dev server..."
  bun run dev >> /home/z/my-project/dev-run.log 2>&1
  echo "[$(date)] Dev server morreu. Reiniciando em 3s..."
  sleep 3
done
