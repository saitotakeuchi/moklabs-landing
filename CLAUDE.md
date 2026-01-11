# Mok Labs Monorepo - Project Context

## Quick Overview

This is a **full-stack monorepo** for Mok Labs, a company focused on AI-powered educational tools for the Brazilian PNLD (Programa Nacional do Livro Didático) program.

**Tech Stack Summary:**
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Backend: Python FastAPI + LangChain RAG
- Database: Supabase (PostgreSQL + pgvector)
- Deployment: Vercel (web) + Fly.io (AI service)

---

## Monorepo Structure

```
/
├── apps/
│   ├── web/                    # Next.js 14 frontend (main application)
│   └── pnld-ai-service/        # Python FastAPI RAG service
├── packages/
│   └── pnld-types/             # Shared TypeScript types
├── docs/                       # Project documentation
├── scripts/                    # Build and deployment scripts
└── .github/workflows/          # CI/CD pipelines
```

---

## Services & Where They Run

| Service | Technology | Port | Deployment |
|---------|-----------|------|------------|
| Web App | Next.js 14 | 3000 | Vercel |
| AI Service | FastAPI | 8000 | Fly.io (gru region) |
| Database | PostgreSQL + pgvector | - | Supabase |
| Cache | Redis | 6379 | Docker (local) / Fly.io |

**Production URLs:**
- Web: `https://moklabs.com.br`
- AI API: `https://pnld-ai-service.fly.dev`

---

## Web App (`apps/web/`)

### Key Directories
```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── api/v1/            # API routes (contact, health, blog)
│   ├── blog/              # Blog pages with MDX
│   ├── pnld/              # PNLD information page
│   ├── pnld-chat/         # AI chat interface
│   │   ├── api/           # Chat API endpoints
│   │   ├── auth/          # Auth routes
│   │   └── dashboard/     # User dashboard
│   └── admin/             # TinaCMS admin panel
├── components/            # React components
├── lib/                   # Utilities & services
│   ├── supabase/         # Auth client & middleware
│   └── api/              # API clients
├── content/              # Static content (MDX, configs)
└── public/               # Static assets
```

### Key Files
- `middleware.ts` - Supabase auth session handling
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/pnld-ai-client.ts` - AI service REST client
- `content/mainContent.ts` - Homepage content
- `content/pnldContent.ts` - PNLD page content

---

## AI Service (`apps/pnld-ai-service/`)

### Key Directories
```
apps/pnld-ai-service/
├── app/
│   ├── api/v1/           # FastAPI endpoints
│   │   ├── chat.py       # RAG chat endpoint
│   │   ├── documents.py  # Document management
│   │   ├── editais.py    # Edital CRUD
│   │   └── health.py     # Health checks
│   ├── services/         # Business logic
│   │   ├── rag.py        # RAG pipeline orchestration
│   │   ├── embeddings.py # OpenAI embeddings
│   │   ├── vector_search.py
│   │   ├── hybrid_search.py
│   │   └── cache_manager.py
│   └── models/           # Pydantic models
├── documentation/        # Detailed API docs
└── tests/               # pytest tests
```

### API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/chat` | POST | RAG chat with streaming |
| `/api/v1/documents` | GET/POST | Document CRUD |
| `/api/v1/editais` | GET/POST | Edital management |

---

## Database Schema (Supabase)

### Core Tables
- `pnld_documents` - Indexed documents
- `pnld_embeddings` - Vector embeddings (1536 dimensions)
- `chat_conversations` - Conversation metadata
- `chat_messages` - Individual messages
- `editais` - PNLD edital notices

### Extensions
- `pgvector` - Vector similarity search
- `pg_trgm` - Trigram text search

---

## Authentication

**Provider:** Supabase Auth

**Flow:**
1. Middleware checks session on protected routes
2. Session stored in HTTP-only cookies
3. Auto-refresh via middleware

**Protected Routes:**
- `/admin/*`
- `/pnld-chat/dashboard`

**Key Files:**
- `lib/supabase/middleware.ts` - Session handling
- `contexts/AuthContext.tsx` - React auth context

---

## Environment Variables

### Web App (`.env.local`)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Email (Resend)
RESEND_API_KEY=
FROM_EMAIL=contato@moklabs.com.br

# Analytics
NEXT_PUBLIC_GA_TRACKING_ID=

# AI Service
NEXT_PUBLIC_PNLD_AI_SERVICE_URL=http://localhost:8000
```

### AI Service (`.env`)
```bash
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Redis
REDIS_URL=redis://localhost:6379
```

---

## Development Commands

### Root Level (pnpm)
```bash
pnpm dev              # Start all dev servers
pnpm build            # Build all apps
pnpm lint             # Lint all apps
pnpm type-check       # TypeScript checks
pnpm format           # Format code
```

### Web App Only
```bash
cd apps/web
pnpm dev              # Next.js dev server (port 3000)
pnpm dev:tina         # Dev with TinaCMS
pnpm build            # Production build
```

### AI Service Only
```bash
cd apps/pnld-ai-service
poetry install        # Install dependencies
poetry run uvicorn app.main:app --reload  # Dev server (port 8000)
poetry run pytest     # Run tests
```

---

## CI/CD

**GitHub Actions Workflows:**
- `ci.yml` - Main CI (lint, type-check, build)
- `pr-checks.yml` - PR validation

**Deployment:**
- Web: Auto-deploy to Vercel on push to main
- AI Service: Deploy to Fly.io via `flyctl deploy`

---

## Key Integrations

| Service | Purpose | Config Location |
|---------|---------|-----------------|
| Supabase | Auth + Database | `lib/supabase/` |
| OpenAI | Embeddings + LLM | AI service `.env` |
| Resend | Transactional email | `app/api/v1/contact/` |
| TinaCMS | Content management | `tina/` |
| Vercel Analytics | Performance metrics | `app/layout.tsx` |

---

## Common Tasks

### Adding a new blog post
1. Create MDX file in `content/blog/`
2. Run `pnpm dev` to preview
3. Build includes automatic MDX processing

### Updating PNLD content
1. Edit `content/pnldContent.ts`
2. Or use TinaCMS admin at `/admin`

### Adding new API endpoint (web)
1. Create route in `app/api/v1/[endpoint]/route.ts`
2. Export GET/POST/etc handlers

### Adding new AI endpoint
1. Create router in `apps/pnld-ai-service/app/api/v1/`
2. Register in `app/main.py`

---

## Troubleshooting

### Supabase auth issues
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify middleware is running (check `middleware.ts`)

### AI service not responding
- Ensure service is running on port 8000
- Check `NEXT_PUBLIC_PNLD_AI_SERVICE_URL` in web app

### Build failures
- Run `pnpm type-check` first to catch TS errors
- Check for missing env vars in Vercel dashboard
