#!/usr/bin/env node
// Observa updates/incoming por arquivos .zip novos (entregues via SCP/SFTP).
// Quando um arquivo aparece, espera ele "estabilizar" (parar de crescer,
// ou seja, o upload/cópia terminou) e então dispara scripts/apply-patch.sh.

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const REPO_DIR = path.resolve(__dirname, "..");
const WATCH_DIR = path.join(REPO_DIR, "updates", "incoming");
const APPLY_SCRIPT = path.join(REPO_DIR, "scripts", "apply-patch.sh");
const STABLE_CHECKS = 3; // nº de checagens seguidas com tamanho igual
const CHECK_INTERVAL_MS = 1500;

fs.mkdirSync(WATCH_DIR, { recursive: true });

const emProcessamento = new Set();

function esperarEstabilizar(filePath, cb) {
  let lastSize = -1;
  let stableCount = 0;
  const timer = setInterval(() => {
    let size;
    try {
      size = fs.statSync(filePath).size;
    } catch {
      clearInterval(timer);
      return; // arquivo sumiu (ex: outro processo já pegou ou foi removido)
    }
    if (size === lastSize) {
      stableCount++;
    } else {
      stableCount = 0;
      lastSize = size;
    }
    if (stableCount >= STABLE_CHECKS) {
      clearInterval(timer);
      cb();
    }
  }, CHECK_INTERVAL_MS);
}

function aplicar(filePath) {
  if (emProcessamento.has(filePath)) return;
  emProcessamento.add(filePath);

  console.log(`[watcher] Novo patch detectado: ${filePath}`);
  const child = spawn("bash", [APPLY_SCRIPT, filePath], {
    cwd: REPO_DIR,
    stdio: "inherit",
  });
  child.on("exit", (code) => {
    console.log(`[watcher] apply-patch.sh finalizou com código ${code}`);
    emProcessamento.delete(filePath);
  });
}

console.log(`[watcher] Observando ${WATCH_DIR} por arquivos .zip...`);

// Processa qualquer .zip que já esteja parado na pasta ao iniciar o watcher
for (const f of fs.readdirSync(WATCH_DIR)) {
  if (f.toLowerCase().endsWith(".zip")) {
    const fullPath = path.join(WATCH_DIR, f);
    esperarEstabilizar(fullPath, () => aplicar(fullPath));
  }
}

fs.watch(WATCH_DIR, (eventType, filename) => {
  if (!filename || !filename.toLowerCase().endsWith(".zip")) return;
  const fullPath = path.join(WATCH_DIR, filename);
  if (!fs.existsSync(fullPath)) return; // evento de remoção
  esperarEstabilizar(fullPath, () => aplicar(fullPath));
});
