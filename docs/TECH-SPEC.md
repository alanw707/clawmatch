# ClawMatch — Technical Specification
**Version:** 1.0  
**Date:** 2026-03-13

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                      │
│  Next.js 15 App Router + tRPC + Tailwind + shadcn/ui     │
│  Auth: NextAuth.js (Google OAuth + Magic Link)           │
└─────────────┬───────────────────────────┬────────────────┘
              │ tRPC / API Routes         │ Webhooks
              ▼                           ▼
┌─────────────────────────┐  ┌──────────────────────────┐
│   Supabase (Database)    │  │  Upstash Redis (Queue)   │
│  PostgreSQL + pgvector   │  │  BullMQ job scheduling   │
│  File Storage (resumes)  │  │  Rate limiting            │
│  Row-Level Security      │  └──────────┬───────────────┘
└─────────────────────────┘              │
                                         ▼
                              ┌──────────────────────┐
                              │  Railway (Workers)    │
                              │  - Scraper worker     │
                              │  - Agent worker       │
                              │  - Matching worker    │
                              └──────┬───────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
             ┌───────────┐  ┌──────────────┐  ┌────────────┐
             │  Apify     │  │  Anthropic   │  │  OpenAI    │
             │  Scrapers  │  │  Claude API  │  │  Embeddings│
             └───────────┘  └──────────────┘  └────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | SSR, API routes, Vercel-native |
| Language | TypeScript (strict) | Type safety across full stack |
| UI | Tailwind CSS + shadcn/ui | Fast iteration, great defaults |
| API | tRPC v11 | End-to-end type safety, no codegen |
| Auth | NextAuth.js v5 | Google OAuth + email magic link |
| Database | Supabase (PostgreSQL 16) | Managed, pgvector, RLS, file storage |
| Vector search | pgvector | Embeddings stored alongside relational data |
| Queue | BullMQ + Upstash Redis | Job scheduling, rate limiting, retries |
| Workers | Railway (Node.js) | Background job processing, autoscale |
| Scraping | Apify (managed actors) | Greenhouse, Lever, Workday, Ashby scrapers |
| Browser automation | Playwright (via Web MCP) | Form-filling, unstructured career pages |
| AI (reasoning) | Claude Sonnet 4.6 (Anthropic) | Agent loop, tailoring, cover letters |
| AI (embeddings) | text-embedding-3-large (OpenAI) | Semantic matching, 3072 dimensions |
| Payments | Stripe | Subscriptions, usage metering |
| Monitoring | Sentry + PostHog | Error tracking + product analytics |
| Email | Resend | Transactional emails (magic links, notifications) |

---

## 3. Database Schema

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'executive')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### profiles (parsed resume + preferences)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resume_url TEXT,                    -- Supabase storage path
  parsed_resume JSONB,               -- structured: skills, experience, education
  job_titles TEXT[],                  -- target roles
  industries TEXT[],                  -- target industries
  locations TEXT[],                   -- preferred locations
  remote_preference TEXT CHECK (remote_preference IN ('remote', 'hybrid', 'onsite', 'any')),
  salary_min INTEGER,
  salary_max INTEGER,
  company_size TEXT[],               -- startup, mid, enterprise
  deal_breakers TEXT[],
  embedding VECTOR(3072),            -- profile embedding for matching
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### jobs
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT,                   -- source-specific ID
  source TEXT NOT NULL,               -- 'greenhouse', 'lever', 'workday', etc.
  source_url TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  salary_min INTEGER,
  salary_max INTEGER,
  posted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  ats_platform TEXT,                  -- which ATS hosts this
  raw_data JSONB,                     -- full scraped payload
  embedding VECTOR(3072),            -- job description embedding
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source, external_id)
);

CREATE INDEX idx_jobs_embedding ON jobs USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_jobs_active ON jobs (is_active, posted_at DESC);
```

### matches (precomputed user↔job scores)
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  score REAL NOT NULL,                -- 0-100 match score
  skills_overlap JSONB,              -- which skills matched
  skills_gap JSONB,                  -- what's missing
  red_flags TEXT[],                  -- scam indicators, keyword traps
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'saved', 'applied', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, job_id)
);

CREATE INDEX idx_matches_user_score ON matches (user_id, score DESC);
```

### applications
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id),
  match_id UUID REFERENCES matches(id),
  status TEXT DEFAULT 'pending_review' CHECK (status IN (
    'pending_review', 'approved', 'applying', 'applied',
    'viewed', 'interviewing', 'rejected', 'offer', 'failed'
  )),
  tailored_resume JSONB,             -- modified resume bullets
  cover_letter TEXT,
  company_research JSONB,            -- agent's research output
  submission_screenshot TEXT,         -- storage path
  submitted_at TIMESTAMPTZ,
  follow_up_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_applications_user ON applications (user_id, created_at DESC);
```

### scrape_runs (tracking scraper health)
```sql
CREATE TABLE scrape_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  jobs_found INTEGER DEFAULT 0,
  jobs_new INTEGER DEFAULT 0,
  jobs_updated INTEGER DEFAULT 0,
  errors JSONB,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed'))
);
```

---

## 4. API Routes (tRPC)

### Auth
- `auth.session` — get current session
- `auth.callback` — OAuth/magic link callback

### Profile
- `profile.get` — get user profile
- `profile.update` — update preferences
- `profile.uploadResume` — upload + parse resume
- `profile.getJobDNA` — computed skills/preference summary

### Jobs
- `jobs.feed` — paginated job feed (filtered, sorted by match score)
- `jobs.get` — single job detail
- `jobs.search` — text search across jobs
- `jobs.filters` — available filter options (locations, companies, etc.)

### Matches
- `matches.list` — user's matched jobs with scores
- `matches.save` — save a job
- `matches.skip` — skip a job

### Applications
- `applications.list` — all user applications
- `applications.get` — single application detail
- `applications.review` — get tailored resume + cover letter for review
- `applications.approve` — approve and submit
- `applications.followUp` — trigger follow-up
- `applications.updateStatus` — manual status update

### Billing
- `billing.getPlans` — subscription tiers
- `billing.createCheckout` — Stripe checkout session
- `billing.portal` — Stripe customer portal
- `billing.usage` — current usage vs limits

---

## 5. Worker Jobs (BullMQ)

### scrape:greenhouse
- Runs every 6 hours
- Fetches all jobs from Greenhouse JSON API endpoints
- Upserts into `jobs` table
- Generates embeddings for new jobs

### scrape:lever
- Same pattern as Greenhouse
- Lever has a clean JSON API per company

### scrape:workday
- Runs every 12 hours (heavier, per-company)
- Uses Apify Workday actor
- Rate-limited to 1 company/10s

### scrape:career-pages
- Web MCP browser agent
- Crawls company `/careers` pages
- Extracts job listings from unstructured HTML
- Lower priority, runs daily

### match:compute
- Triggered when: new user profile, profile update, or new jobs ingested
- Computes cosine similarity between user embedding and job embeddings
- Stores top 200 matches per user in `matches` table
- Runs skills gap analysis

### agent:apply
- Triggered when user approves an application
- Steps:
  1. Research company (Web MCP → company site, news, Glassdoor)
  2. Tailor resume (Claude: reorder bullets, inject keywords)
  3. Generate cover letter (Claude: company-specific hooks)
  4. If human review ON → save as `pending_review`, notify user
  5. If approved → Web MCP fills form + submits
  6. Screenshot confirmation → store in Supabase
  7. Update application status

### agent:follow-up
- Checks applications older than 10 days with no status change
- Drafts follow-up email via Claude
- Notifies user for approval before sending

---

## 6. Agent Loop Detail

```
User clicks "Apply" on a matched job
         │
         ▼
┌─────────────────────┐
│  1. RESEARCH         │
│  - Scrape company    │
│    about page        │
│  - Recent news       │
│  - Glassdoor data    │
│  - Team/dept info    │
│  - Tech stack        │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  2. TAILOR           │
│  - Match JD keywords │
│  - Reorder resume    │
│    bullets by        │
│    relevance         │
│  - Quantify impact   │
│    statements        │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  3. DRAFT            │
│  - Cover letter with │
│    company hooks     │
│  - Answer screening  │
│    questions         │
│  - "Why this co?"    │
│    paragraph         │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  4. REVIEW GATE      │
│  (ON by default)     │
│  - Show user the     │
│    tailored package  │
│  - User approves /   │
│    edits / rejects   │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  5. SUBMIT           │
│  - Web MCP opens     │
│    application form  │
│  - Fills fields      │
│  - Uploads resume    │
│  - Submits           │
│  - Screenshots       │
│    confirmation      │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  6. TRACK            │
│  - Log to tracker    │
│  - Schedule follow-  │
│    up check (10d)    │
│  - Monitor for       │
│    status changes    │
└─────────────────────┘
```

---

## 7. File Structure

```
clawmatch/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Sidebar + nav
│   │   │   ├── page.tsx            # Job feed (default)
│   │   │   ├── matches/page.tsx    # Matched jobs
│   │   │   ├── applications/
│   │   │   │   ├── page.tsx        # Application tracker
│   │   │   │   └── [id]/page.tsx   # Single application detail
│   │   │   ├── profile/page.tsx    # Profile & preferences
│   │   │   ├── interview-prep/page.tsx
│   │   │   └── settings/page.tsx   # Account, billing, preferences
│   │   ├── api/
│   │   │   ├── trpc/[trpc]/route.ts
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/route.ts
│   │   │   │   └── apify/route.ts
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx                # Landing page
│   ├── server/
│   │   ├── trpc/
│   │   │   ├── router.ts           # Root tRPC router
│   │   │   ├── context.ts
│   │   │   └── routers/
│   │   │       ├── profile.ts
│   │   │       ├── jobs.ts
│   │   │       ├── matches.ts
│   │   │       ├── applications.ts
│   │   │       └── billing.ts
│   │   ├── db/
│   │   │   ├── client.ts           # Supabase client
│   │   │   ├── schema.ts           # Drizzle schema
│   │   │   └── migrations/
│   │   └── services/
│   │       ├── resume-parser.ts    # PDF → structured data
│   │       ├── embedding.ts        # OpenAI embedding generation
│   │       ├── matching.ts         # Cosine similarity + scoring
│   │       └── agent/
│   │           ├── research.ts     # Company research step
│   │           ├── tailor.ts       # Resume tailoring step
│   │           ├── cover-letter.ts # Cover letter generation
│   │           ├── submit.ts       # Web MCP form submission
│   │           └── orchestrator.ts # Full agent loop coordinator
│   ├── workers/
│   │   ├── index.ts                # BullMQ worker entrypoint
│   │   ├── scrapers/
│   │   │   ├── greenhouse.ts
│   │   │   ├── lever.ts
│   │   │   ├── workday.ts
│   │   │   └── career-pages.ts
│   │   ├── match-compute.ts
│   │   ├── agent-apply.ts
│   │   └── agent-follow-up.ts
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── job-card.tsx
│   │   ├── match-score-badge.tsx
│   │   ├── application-timeline.tsx
│   │   ├── review-gate-modal.tsx
│   │   ├── resume-upload.tsx
│   │   └── preference-wizard.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── stripe.ts
│   └── types/
│       ├── job.ts
│       ├── profile.ts
│       └── application.ts
├── public/
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 8. Environment Variables

```env
# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://getclawmatch.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Scraping
APIFY_API_TOKEN=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email
RESEND_API_KEY=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
```

---

## 9. Deployment

### Vercel (Frontend + API)
- Auto-deploy from `main` branch
- Preview deployments on PRs
- Edge functions for auth middleware

### Railway (Workers)
- Dockerfile-based deployment
- Auto-restart on crash
- Scales 0→N based on queue depth
- Separate service for scraper vs agent workers

### Supabase
- Managed PostgreSQL with pgvector extension
- Row-Level Security for multi-tenant data isolation
- Scheduled CRON for job expiry cleanup

---

## 10. Security

- All API routes authenticated via NextAuth session
- Supabase RLS: users can only access their own profiles/applications
- Resume files: signed URLs with 1-hour expiry
- Rate limiting: 20 applications/day enforced at API + worker level
- Stripe webhook signature verification
- CSRF protection via Next.js defaults
- No credentials stored in client — all AI/scraping keys server-side only
