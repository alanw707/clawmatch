# ClawMatch — Product Requirements Document
**Version:** 1.0  
**Date:** 2026-03-13  
**Status:** Draft

---

## 1. Overview

### Problem Statement
Job seekers in 2025-2026 are facing pandemic-level unemployment, averaging 6-11 months of searching. The existing tools (LazyApply, Sonara, JobCopilot) solve the wrong problem — they spam hundreds of generic applications, which destroys reputation with recruiters and achieves low results (LazyApply: 52% 1-star reviews). No existing platform offers a truly agentic, quality-first job search experience.

### Solution
ClawMatch is a fully agentic job search platform that acts as a personal career agent — finding, qualifying, tailoring, and applying to jobs on behalf of the user with human-level judgment, not spam volume. Powered by Web MCP for real-time job discovery across 175,000+ company career pages and 42 ATS platforms.

### Vision
> "Your AI career agent. Not a bot. A real advocate."

---

## 2. Goals

**Primary:**
- Help job seekers land interviews faster through quality-matched, tailored applications
- Build the largest real-time job database by aggregating directly from ATS platforms (Greenhouse, Lever, Workday, Ashby, Rippling, iCIMS, etc.)
- Provide a fully agentic end-to-end workflow from job discovery → application → interview prep

**Secondary:**
- Create a two-sided marketplace connecting quality candidates with recruiters
- Generate sustainable SaaS revenue via freemium B2C, scaling to B2B recruiter tools

**Non-Goals (v1):**
- Resume builder (use existing resume, enhance it per application)
- Job posting / recruiter side (v2)
- Mobile app (web-first)

---

## 3. Target Users

### Primary: Active Job Seekers
- Recently laid off (tech, finance, media — hardest-hit sectors)
- 25-45 years old, college-educated, mid-to-senior level
- Frustrated with manual applications, ATS black holes, and ghosting
- Tech-comfortable, willing to pay for results
- **Pain:** Spending 20-40 hours/week applying with little return

### Secondary (v2): Recruiters & Hiring Managers
- In-house recruiters drowning in unqualified inbound
- Want pre-screened, AI-vetted shortlists
- Currently paying $5k-50k/month for LinkedIn Recruiter or job board access

---

## 4. Core Features (MVP — v1)

### 4.1 Onboarding & Profile Setup
- Resume upload (PDF/DOCX) — AI parses and structures into canonical profile
- Preference wizard: role titles, industries, location (remote/hybrid/onsite), salary range, company size, culture signals
- "Job DNA" score profile: hard skills, soft skills, career trajectory, deal-breakers
- Estimated setup time: < 10 minutes

### 4.2 Job Discovery Engine
**Data sources (priority order):**
1. Greenhouse, Lever, Ashby, Rippling — direct ATS API/scraping (cleanest data, fewest ToS issues)
2. Workday — per-company instance scraping via Web MCP
3. Company career pages — direct `/careers` and `/jobs` URL patterns via Web MCP
4. Niche boards — Wellfound (startups), Dice (tech), RemoteOK, We Work Remotely, USAJobs
5. RSS feeds — real-time, zero friction, widely supported

**NOT included in v1:** Indeed (bot detection + ToS risk), LinkedIn (legal risk)

**Output:**
- Real-time job feed updated every 4-6 hours
- Match score (0-100) per listing vs. user Job DNA
- Jobs deduplicated across sources
- Target: 500,000+ active listings at launch via ATS aggregation

### 4.3 AI Matching & Ranking
- Semantic matching: job description vs. candidate profile (embeddings-based)
- Skills gap analysis: highlight what you have vs. what they want
- Red flag detection: identify likely ATS keyword traps, low-quality postings, scam listings
- Confidence score: how likely this application will get human eyes
- Filters: match %, location, salary, date posted, remote status, company size

### 4.4 Agentic Application Workflow
Each application goes through the full agent loop:

1. **Research phase** — Agent reads company page, Glassdoor, recent news, team structure
2. **Tailoring phase** — Resume bullets reordered/reworded to match JD keywords; cover letter drafted with company-specific hooks
3. **Human review gate** — User sees the tailored resume + cover letter before submission (opt-in/out)
4. **Submit phase** — Agent fills and submits the actual application form via Web MCP
5. **Confirmation** — Screenshot/receipt of submission logged to tracker

**Quality guardrails (differentiator vs. competitors):**
- Max 20 applications/day per user (no spam cannons)
- Won't apply if match score < 60 unless user manually overrides
- Flags duplicate applications (already applied within 90 days)
- Detects and skips ghost/scam postings

### 4.5 Application Tracker
- Dashboard: all applications, status (applied/viewed/interviewing/rejected/offer)
- Follow-up reminders: "No response in 10 days — want to follow up?"
- Agent-drafted follow-up emails per application
- Analytics: response rate, match score correlation, best-performing resume versions

### 4.6 Interview Prep (Triggered on Callback)
- Company research brief: culture, recent news, likely interview format
- Role-specific question bank with AI-coached answers
- STAR format response builder
- "Why this company?" talking points auto-generated from company research

---

## 5. Technical Architecture

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js (email magic link + Google OAuth)

### Backend
- **API:** Next.js API routes + tRPC for type safety
- **Database:** PostgreSQL (Supabase) — user profiles, jobs, applications
- **Queue:** BullMQ (Redis) — scraping jobs, application tasks, AI tasks
- **Search/Matching:** pgvector (embeddings stored in Postgres) or Qdrant

### AI Layer
- **Model:** Claude claude-sonnet-4-6 (primary) via Anthropic API — best instruction-following for agentic loops
- **Resume parsing:** Structured extraction from PDF/DOCX
- **Matching:** text-embedding-3-large (OpenAI) for semantic similarity
- **Cover letter / tailoring:** Claude with company + JD context injection
- **Orchestration:** Custom agent loop (research → tailor → review → submit → confirm)

### Web MCP / Scraping
- **ATS scrapers:** Greenhouse, Lever, Ashby (structured JSON endpoints — cleanest)
- **Workday:** Per-company Playwright-based scraper (Workday has no unified API)
- **Career pages:** Web MCP browser agent for unstructured company sites
- **Rate limiting:** Respectful scraping — 1 req/2s per domain, respect robots.txt
- **Infrastructure:** Apify platform (managed scrapers) or self-hosted via Playwright + BullMQ

### Infrastructure
- **Hosting:** Vercel (frontend) + Railway or Render (backend workers)
- **Storage:** Supabase (DB + file storage for resumes)
- **Monitoring:** Sentry + PostHog (product analytics)

---

## 6. Monetization

| Tier | Price | Limits | Target |
|------|-------|--------|--------|
| **Free** | $0/mo | 10 applications/mo, basic matching | Acquisition / trial |
| **Pro** | $29/mo | Unlimited apps (max 20/day), full tailoring, tracker, interview prep | Active job seekers |
| **Executive** | $99/mo | White-glove mode, company deep-research, LinkedIn optimization brief, priority queue | Senior/executive seekers |
| **B2B Recruiter** *(v2)* | $299+/mo | Post jobs, receive AI-pre-screened shortlists, candidate ranking | Hiring teams |

**Revenue model:** SaaS subscription (monthly). No per-application fees.

**Year 1 target:** 1,000 Pro users = $29k MRR

---

## 7. Competitive Positioning

| | ClawMatch | LazyApply | Sonara | JobCopilot |
|--|----------|-----------|--------|------------|
| Max apps/day | 20 (quality) | 750 (spam) | ~50 | ~50 |
| Application tailoring | Per-application | Generic | Partial | Generic |
| Company research | ✅ | ❌ | ❌ | ❌ |
| ATS database | 175k+ company sites | Limited | Limited | Limited |
| Web MCP | ✅ | ❌ | ❌ | ❌ |
| Application tracking | ✅ | Basic | Basic | ✅ |
| Interview prep | ✅ | ❌ | ❌ | ❌ |
| Trustpilot rating | TBD | 1-star dominant | Mixed | 4.2/5 (113 reviews) |
| Price | $29/mo | $99/mo | Premium | $19-56/mo |

**Headline differentiator:** *"Every competitor sends 750 generic blasts. We send 20 perfect ones."*

---

## 8. MVP Milestones

### Phase 1 — Core (Weeks 1-4)
- [ ] Auth + user onboarding
- [ ] Resume parser (PDF → structured profile)
- [ ] Job DNA preference wizard
- [ ] Greenhouse + Lever scraper (biggest ATS coverage, cleanest data)
- [ ] Basic match scoring (embedding similarity)
- [ ] Job feed UI with filters

### Phase 2 — Agent Loop (Weeks 5-8)
- [ ] AI resume tailoring per application
- [ ] AI cover letter generation (with company research)
- [ ] Human review gate UI
- [ ] Web MCP form-fill + submission
- [ ] Application tracker

### Phase 3 — Polish + Launch (Weeks 9-12)
- [ ] Stripe integration + subscription tiers
- [ ] Interview prep module
- [ ] Follow-up agent
- [ ] Workday + Ashby + Rippling scrapers
- [ ] Public launch + waitlist conversion

---

## 9. Success Metrics

| Metric | Target (Month 3) |
|--------|-----------------|
| Registered users | 500 |
| Paying subscribers | 100 |
| MRR | $2,900 |
| Avg. applications sent/user/week | 15-20 |
| User-reported interview rate | >15% (vs. ~3-5% industry avg for spray-and-pray) |
| Application submission success rate | >95% |
| NPS | >50 |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ATS platforms block scrapers | Medium | High | Rate-limit respectfully; use Apify managed infra; focus on Greenhouse/Lever which have JSON endpoints |
| AI tailoring produces generic output | Medium | High | Per-application company research context injection; human review gate |
| Users spam applications anyway | Low | Medium | Hard cap at 20/day; match score floor of 60 |
| Competitor copies the model | High | Medium | Speed to market; brand trust; network effects (recruiter side v2) |
| Application form changes break Web MCP | Medium | Medium | Playwright selectors + fallback to manual flagging |

---

## 11. Decisions Made

1. **Name:** ClawMatch — "Your AI Career Agent" | Tagline: "Your agent applies. You interview."
2. **Domains:** getclawmatch.com (primary) + clawmatch.me (redirect)
3. **Scraping infra:** Apify (managed) for speed-to-market
4. **Human review gate:** ON by default, opt-out if user wants full autonomy
5. **Hosting:** Vercel (frontend) + Railway/Fly.io (workers) + Supabase (DB) + Upstash (Redis queue) — ~$50-100/mo at launch

## 12. Open Questions

1. **Recruiter side timeline:** v2 or fundraising milestone?
2. **Launch strategy:** Waitlist + Product Hunt, or soft launch?
