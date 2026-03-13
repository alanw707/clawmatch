# ClawMatch — Your AI Career Agent

> Your agent applies. You interview.

ClawMatch is a fully agentic job search platform. AI agents find jobs from 175,000+ company career pages, tailor your resume per application, and submit — while you focus on interviews.

## What makes ClawMatch different

- **Quality over volume** — 20 perfect applications beat 750 generic ones
- **Truly agentic** — researches companies, tailors resumes, generates cover letters, submits forms
- **Biggest database** — scrapes Greenhouse, Lever, Workday, Ashby, Rippling + direct career pages
- **Human review gate** — see everything before it sends (on by default)
- **Interview prep** — when you get a callback, your agent briefs you on the company

## Tech Stack

- **Frontend:** Next.js 15, Tailwind CSS, shadcn/ui
- **API:** tRPC v11
- **Database:** Supabase (PostgreSQL + pgvector)
- **Queue:** BullMQ + Upstash Redis
- **AI:** Claude Sonnet 4.6 (agent loop) + OpenAI embeddings (matching)
- **Scraping:** Apify + custom scrapers (Greenhouse, Lever)
- **Payments:** Stripe
- **Hosting:** Vercel (frontend) + Railway (workers)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and fill in your keys
cp .env.example .env

# Generate DB migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Start dev server
npm run dev

# Start workers (separate terminal)
npm run workers:dev
```

## Project Structure

```
src/
├── app/                    # Next.js pages + API routes
├── server/
│   ├── trpc/              # tRPC routers
│   ├── db/                # Drizzle schema + migrations
│   └── services/
│       └── agent/         # AI agent orchestrator
├── workers/
│   ├── scrapers/          # Greenhouse, Lever, etc.
│   └── index.ts           # BullMQ worker process
├── components/            # React components
├── lib/                   # Utilities
└── types/                 # TypeScript types
```

## Links

- **Website:** [getclawmatch.com](https://getclawmatch.com)
- **PRD:** See `docs/PRD.md`
- **Tech Spec:** See `docs/TECH-SPEC.md`

## License

Proprietary — 168 Media Group
