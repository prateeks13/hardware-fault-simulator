# 🇫🇷 Apprends — Local Quick Start

Run the full app locally in **5 minutes** with VSCode + Docker.

---

## Prerequisites

| Tool | Download |
|------|----------|
| **Node.js 20+** | https://nodejs.org |
| **Docker Desktop** | https://www.docker.com/products/docker-desktop/ |
| **VSCode** | https://code.visualstudio.com |

> You do **not** need a real database, Stripe account, or API key to see the full UI.

---

## Option A — One-command setup (recommended)

### Mac / Linux
```bash
cd apprends
chmod +x setup.sh
./setup.sh
```

### Windows (PowerShell as Administrator)
```powershell
cd apprends
Set-ExecutionPolicy -Scope Process Bypass
.\setup.ps1
```

That's it. The script will:
1. Copy `.env.demo` → `.env`
2. Start a PostgreSQL container via Docker
3. Install Node dependencies
4. Push the Prisma schema and seed 24 sections of sample content
5. Open `http://localhost:3000` and start the dev server

---

## Option B — Manual setup (if you prefer control)

```bash
# 1. Start PostgreSQL
cd apprends
docker compose up -d db

# 2. Create .env
cp .env.demo .env

# 3. Install dependencies
npm install --legacy-peer-deps --ignore-scripts
no_proxy="*" HTTPS_PROXY="" npx prisma generate   # Mac/Linux
# Windows: $env:HTTPS_PROXY=""; npx prisma generate

# 4. Apply schema + seed
npx prisma db push
npx prisma db seed

# 5. Start dev server
npm run dev
```

Then open **http://localhost:3000**

---

## What to check in the browser

### Pages to visit
| URL | What you'll see |
|-----|-----------------|
| `/` | Animated landing page with hero, feature grid, pricing teaser |
| `/pricing` | Toggle monthly/yearly, interactive plan cards |
| `/signup` | Sign-up form (creates a real account in your local DB) |
| `/dashboard` | Radial XP chart, skill progress cards, achievement badges |
| `/learn/reading` | 8 exercise sections for the Reading skill |
| `/learn/reading/mcq_mock_test/<id>` | Multiple-choice exam with timer |
| `/learn/listening` | 8 sections for Listening |
| `/learn/writing` | 8 sections for Writing (AI grading optional) |

### Interactive features that work without any API keys
- ✅ Sign up with email + password → auto-login → dashboard
- ✅ MCQ, True/False, Cloze, Sentence ordering, Jumble words, Conjugation, Flashcards
- ✅ Submit answers → server-side grading → result screen with confetti (≥80%)
- ✅ XP earned, streak tracking, level progress bar
- ✅ Responsive design — resize browser or use DevTools mobile view
- ✅ Dark mode — add `dark` class to `<html>` in DevTools Elements panel

### Features that need real credentials
| Feature | What to add to `.env` |
|---------|----------------------|
| Google OAuth | `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` |
| Stripe payments | `STRIPE_SECRET_KEY` + price IDs |
| AI writing grader | `ANTHROPIC_API_KEY` |

---

## VSCode recommended setup

Install these extensions for the best experience:

```
ESLint                  dbaeumer.vscode-eslint
Tailwind CSS IntelliSense  bradlc.vscode-tailwindcss
Prisma                  Prisma.prisma
Pretty TypeScript Errors  YoavBls.pretty-ts-errors
```

Open the workspace:
```bash
code apprends/
```

Then press **F5** or use the Run panel — or just use the integrated terminal:
```bash
npm run dev
```

---

## Adding real credentials later

Edit `.env` and fill in the keys:

```bash
# Stripe → https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Create two prices in Stripe → Products → Add product
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_YEARLY="price_..."

# Stripe → Webhooks → Add endpoint → http://localhost:3000/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET="whsec_..."

# Google → console.cloud.google.com → APIs & Services → Credentials
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Anthropic → console.anthropic.com
ANTHROPIC_API_KEY="sk-ant-..."
```

Restart `npm run dev` after editing `.env`.

---

## Reset the database

```bash
docker compose down -v   # wipes postgres volume
docker compose up -d db
npx prisma db push
npx prisma db seed
```

## Stop everything

```bash
# Stop dev server: Ctrl+C
docker compose down      # stops postgres (keeps data)
docker compose down -v   # stops postgres AND deletes data
```
