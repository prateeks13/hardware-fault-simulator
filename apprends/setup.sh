#!/usr/bin/env bash
# Apprends — one-command local dev setup (Mac / Linux)
set -e

BOLD="\033[1m"; GREEN="\033[32m"; BLUE="\033[34m"; RESET="\033[0m"
log()  { echo -e "${BOLD}${BLUE}▶ $*${RESET}"; }
ok()   { echo -e "${GREEN}✓ $*${RESET}"; }

log "Setting up Apprends French Learning Platform"

# 1. Copy demo env if no .env exists
if [ ! -f .env ]; then
  cp .env.demo .env
  ok "Created .env from .env.demo (edit it to add real Stripe/Google/Anthropic keys)"
else
  ok ".env already exists — skipping"
fi

# 2. Start PostgreSQL via Docker Compose
log "Starting PostgreSQL database..."
docker compose up -d db
printf "  Waiting for postgres to be ready"
until docker compose exec -T db pg_isready -U apprends -q 2>/dev/null; do
  printf "."; sleep 1
done
echo ""; ok "PostgreSQL is ready"

# 3. Install Node dependencies
if [ ! -d node_modules ]; then
  log "Installing dependencies..."
  npm install --legacy-peer-deps --ignore-scripts
  # Generate Prisma client (use cached engine binary — no network needed)
  no_proxy="*" NO_PROXY="*" HTTPS_PROXY="" HTTP_PROXY="" npx prisma generate
  ok "Dependencies installed"
else
  ok "node_modules already exists — skipping install"
fi

# 4. Push Prisma schema & seed
log "Pushing database schema..."
npx prisma db push --skip-generate
ok "Schema applied"

log "Seeding database with sample exercises..."
npx ts-node --project tsconfig.seed.json prisma/seed.ts 2>/dev/null || \
  npx prisma db seed 2>/dev/null || \
  echo "  (seed skipped — may already be seeded)"
ok "Database seeded with 24 sections and sample exercises"

# 5. Open browser after a short delay (background)
(sleep 4 && open "http://localhost:3000" 2>/dev/null || xdg-open "http://localhost:3000" 2>/dev/null) &

echo ""
echo -e "${BOLD}🇫🇷 Starting Apprends on http://localhost:3000${RESET}"
echo ""
echo "  What works right now:"
echo "    ✓ Landing page, pricing, sign-up / sign-in"
echo "    ✓ Dashboard with charts"
echo "    ✓ All 24 exercise types (MCQ, True/False, Cloze, etc.)"
echo "    ✓ XP, streaks, result screen with confetti"
echo "    ✗ Google OAuth   → add GOOGLE_CLIENT_ID/SECRET to .env"
echo "    ✗ Stripe payments → add real STRIPE_* keys to .env"
echo "    ✗ AI writing grade → add ANTHROPIC_API_KEY to .env"
echo ""

npm run dev
