#!/bin/sh
# Post-deploy warm-up: waits for the Next.js server to be ready,
# then calls /api/warm-up to refresh ISR cache with real DB data.
# Build-time prerenders are empty (no DB); this ensures users
# never see stale empty pages after deployment.

MAX_RETRIES=30
RETRY_INTERVAL=2
URL="http://localhost:3000/api/warm-up"

echo "[warm-up] Waiting for server to be ready..."

i=0
while [ "$i" -lt "$MAX_RETRIES" ]; do
  STATUS=$(node -e "
    const http = require('http');
    http.get('http://localhost:3000/api/health', r => {
      process.stdout.write(String(r.statusCode));
      process.exit(0);
    }).on('error', () => {
      process.stdout.write('0');
      process.exit(0);
    });
  " 2>/dev/null)

  if [ "$STATUS" = "200" ]; then
    echo "[warm-up] Server ready, triggering ISR revalidation..."
    RESULT=$(node -e "
      const http = require('http');
      http.get('$URL', r => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => { process.stdout.write(d); process.exit(0); });
      }).on('error', e => {
        process.stdout.write(e.message);
        process.exit(1);
      });
    " 2>/dev/null)
    echo "[warm-up] Done: $RESULT"
    exit 0
  fi

  i=$((i + 1))
  sleep "$RETRY_INTERVAL"
done

echo "[warm-up] Server did not become ready in time, skipping warm-up"
exit 0
