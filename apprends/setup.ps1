# Apprends — one-command local dev setup (Windows PowerShell)
# Run with: .\setup.ps1
$ErrorActionPreference = "Stop"

function log  { param($msg) Write-Host "▶ $msg" -ForegroundColor Cyan }
function ok   { param($msg) Write-Host "✓ $msg" -ForegroundColor Green }

log "Setting up Apprends French Learning Platform"

# 1. Copy demo env
if (-not (Test-Path ".env")) {
    Copy-Item ".env.demo" ".env"
    ok "Created .env from .env.demo (edit it to add real Stripe/Google/Anthropic keys)"
} else {
    ok ".env already exists — skipping"
}

# 2. Start PostgreSQL
log "Starting PostgreSQL database..."
docker compose up -d db
Write-Host "  Waiting for postgres" -NoNewline
do {
    Start-Sleep 1; Write-Host "." -NoNewline
    $ready = docker compose exec -T db pg_isready -U apprends 2>$null
} while ($LASTEXITCODE -ne 0)
Write-Host ""
ok "PostgreSQL is ready"

# 3. Install dependencies
if (-not (Test-Path "node_modules")) {
    log "Installing dependencies..."
    npm install --legacy-peer-deps --ignore-scripts
    $env:no_proxy = "*"; $env:NO_PROXY = "*"; $env:HTTPS_PROXY = ""; $env:HTTP_PROXY = ""
    npx prisma generate
    ok "Dependencies installed"
} else {
    ok "node_modules already exists — skipping install"
}

# 4. Database schema + seed
log "Pushing database schema..."
npx prisma db push --skip-generate
ok "Schema applied"

log "Seeding database..."
try { npx prisma db seed } catch { Write-Host "  (seed skipped)" -ForegroundColor Yellow }
ok "Database seeded"

# 5. Open browser
Start-Job { Start-Sleep 4; Start-Process "http://localhost:3000" }

Write-Host ""
Write-Host "🇫🇷 Starting Apprends on http://localhost:3000" -ForegroundColor Cyan -BackgroundColor Black
Write-Host ""
Write-Host "  What works right now:"
Write-Host "    OK  Landing page, pricing, sign-up / sign-in"
Write-Host "    OK  Dashboard with charts"
Write-Host "    OK  All 24 exercise types"
Write-Host "    OK  XP, streaks, result screen with confetti"
Write-Host "    NO  Google OAuth   -> add GOOGLE_CLIENT_ID/SECRET to .env"
Write-Host "    NO  Stripe payments -> add real STRIPE_* keys to .env"
Write-Host "    NO  AI writing grade -> add ANTHROPIC_API_KEY to .env"
Write-Host ""

npm run dev
