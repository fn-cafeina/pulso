#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cleanup() {
    echo ""
    echo "Deteniendo servicios..."
    kill "$PID_BACKEND" "$PID_FRONTEND" 2>/dev/null
    wait "$PID_BACKEND" "$PID_FRONTEND" 2>/dev/null
    echo "Listo."
    exit 0
}
trap cleanup SIGINT SIGTERM

echo "Iniciando backend (Air)..."
make -C "$ROOT/backend" dev &
PID_BACKEND=$!

echo "Iniciando frontend (Vite)..."
(cd "$ROOT/frontend" && npm run dev) &
PID_FRONTEND=$!

wait
