# Apprends 🇫🇷

A full-stack French learning platform for TEF and DELF exam preparation.
**24 exercise types** across Reading, Listening, and Writing, with AI-assisted grading,
Stripe subscriptions, and gamified progression.

---

## Tech Stack

| Layer        | Tech                              |
|--------------|-----------------------------------|
| Framework    | Next.js 15 (App Router) + TypeScript |
| Styling      | Tailwind CSS + Framer Motion      |
| Database     | PostgreSQL via Prisma ORM         |
| Auth         | Auth.js v5 (credentials + Google) |
| Payments     | Stripe Subscriptions + Webhooks   |
| AI Grading   | Anthropic Claude (Haiku)          |
| State        | TanStack Query + React Server Components |

---

## Quick Start

### 1. Prerequisites

- Node.js 20+
- PostgreSQL database (Supabase, Neon, Railway, or local)
- Stripe account (test mode)
- Anthropic API key (for AI grading)
- Google OAuth credentials (optional but recommended)

### 2. Environment Setup

```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup

```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed with sample exercises (2-3 per section, all 24 sections)
npm run db:seed
```

### 5. Stripe Setup

In the Stripe Dashboard (test mode):

1. Create two **Subscription** products:
   - Monthly: $9.00/month → copy `price_id` to `STRIPE_PRICE_MONTHLY`
   - Yearly: $99.00/year → copy `price_id` to `STRIPE_PRICE_YEARLY`

2. Set up a webhook at `https://yourdomain.com/api/webhooks/stripe` with events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

3. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

For local development:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 6. Google OAuth Setup

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env`

### 7. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## Security Architecture

### Paywall Enforcement

The paywall is enforced **server-side at multiple layers**:

1. **Next.js Middleware** (`src/middleware.ts`) — checks every request to `/learn/*`, `/dashboard`, `/api/content/*`, and `/api/grade` for:
   - Valid JWT session
   - Active subscription status in the database

2. **API Routes** — all content/grading endpoints re-verify auth and subscription independently using `auth()` from Auth.js

3. **Data hiding** — `answerKey`, `rubric`, and `referenceAnswer` are **never** included in client-facing queries; grading happens exclusively server-side

4. **AI Grading** — the Anthropic API key lives only in server-side code; the grade endpoint wraps user submissions in a safe prompt structure to prevent injection

### Key Security Features

- bcrypt password hashing (cost factor 12)
- Secure HTTP-only session cookies
- Stripe webhook signature verification
- Input sanitization + parameterized queries (Prisma)
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Rate limiting on registration endpoint
- Per-user daily AI grading quota (10/day) with DB persistence

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Sign-in, sign-up, reset-password
│   ├── account/         # Subscription management
│   ├── api/
│   │   ├── auth/        # NextAuth + register + reset
│   │   ├── content/     # Sections, exercises, submit
│   │   ├── grade/       # AI grading endpoint
│   │   ├── progress/    # XP + streak data
│   │   ├── stripe/      # Checkout + portal
│   │   └── webhooks/    # Stripe webhook
│   ├── dashboard/       # User dashboard
│   ├── learn/           # Skill pages + exercise player
│   └── pricing/         # Pricing page
├── auth.ts              # NextAuth configuration
├── middleware.ts        # Paywall + auth middleware
├── components/
│   ├── exercises/       # 8+ exercise type components
│   ├── layout/          # Navbar
│   ├── learn/           # Skill page component
│   └── ui/              # Button, Input, Card, Badge...
└── lib/
    ├── ai-grader.ts     # Anthropic grading logic
    ├── auth.ts          # (re-exported from root auth.ts)
    ├── db.ts            # Prisma singleton
    ├── stripe.ts        # Stripe client + prices
    └── utils.ts         # XP/level math, helpers
prisma/
├── schema.prisma        # Full data model
└── seed.ts              # 24 sections × 2-3 exercises each
```

---

## Data Model Summary

| Model              | Purpose                                    |
|--------------------|--------------------------------------------|
| User               | Auth + profile                             |
| Account/Session    | NextAuth standard tables                   |
| Subscription       | Stripe subscription state (source of truth)|
| Skill              | READING / LISTENING / WRITING              |
| Section            | 8 sections per skill (24 total)            |
| Exercise           | Individual exercises with payload JSON     |
| Attempt            | User answers + scores + AI feedback        |
| Progress           | XP, level, streak per user per skill       |
| Achievement        | Badge definitions                          |
| UserAchievement    | Earned badges                              |
| AiGradingQuota     | Daily AI grading rate limit                |

---

## Paywall Demonstration

To verify the paywall:

1. Create an account but do **not** subscribe
2. Try to access `/api/content/exercises?id=<any_id>` → returns `403`
3. Try to navigate to `/learn/reading` → redirects to `/pricing`
4. No lesson content appears in any network response for unauthenticated or unpaid users

---

## Accepted Exam Criteria

All exercises are mapped to TEF/DELF criteria:

- Reading: comprehension, vocabulary, grammar, skimming/scanning
- Listening: dictation accuracy, comprehension, matching
- Writing: DELF/TEF rubrics (task completion, coherence, vocab, grammar)

AI grading follows certified DELF/TEF examiner criteria using Anthropic Claude.

---

## Development Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Sync schema to DB
npm run db:migrate   # Run migrations
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
```
