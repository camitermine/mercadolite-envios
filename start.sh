#!/usr/bin/env bash
# Levanta las tres apps con datos de prueba (macOS / Linux). Ctrl+C cierra todo.
set -euo pipefail
cd "$(dirname "$0")"

for cmd in java node pnpm curl; do
  command -v "$cmd" >/dev/null || { echo "Falta '$cmd'. Mirá los requisitos en el README."; exit 1; }
done

[ -d envios/node_modules ] || (cd envios && pnpm install)
[ -d tienda/node_modules ] || (cd tienda && pnpm install)

pids=()
cleanup() { echo; echo "Cerrando..."; kill "${pids[@]}" 2>/dev/null || true; (cd backend && ./gradlew --stop >/dev/null 2>&1) || true; }
trap cleanup EXIT INT TERM

chmod +x backend/gradlew
(cd backend && SPRING_PROFILES_ACTIVE=demo ./gradlew bootRun) & pids+=($!)
(cd envios && pnpm dev) & pids+=($!)
(cd tienda && pnpm dev) & pids+=($!)

echo "Esperando a la API (la primera vez puede tardar unos minutos)..."
until curl -s -o /dev/null http://localhost:8080/carriers; do sleep 2; done

echo
echo "  Tienda (cliente)    http://localhost:5174"
echo "  Envíos (operador)   http://localhost:5173"
echo "  API REST            http://localhost:8080"
echo
echo "Ctrl+C para cerrar todo."
wait
