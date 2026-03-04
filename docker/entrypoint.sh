#!/bin/sh
set -e

echo "[entrypoint] Running migrations..."
npm run db:migrate

echo "[entrypoint] Starting server..."
node src/index.js
