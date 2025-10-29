# PNLD AI Service

FastAPI backend service for RAG-based (Retrieval-Augmented Generation) PNLD chat functionality using Supabase and OpenAI.

## Overview

This service provides AI-powered chat capabilities for answering questions about PNLD (Programa Nacional do Livro Didático) editals using:

- **FastAPI** for the REST API
- **Supabase** for PostgreSQL database with pgvector extension
- **OpenAI** for embeddings and LLM responses
- **LangChain** for RAG orchestration

## Features

- Document indexing with vector embeddings
- Semantic search using pgvector
- RAG-based chat responses
- Conversation history tracking
- Health check endpoints

## Project Structure

```
apps/pnld-ai-service/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── api/                 # API routes
│   │   └── v1/
│   │       ├── health.py    # Health check endpoints
│   │       ├── chat.py      # Chat endpoints
│   │       └── documents.py # Document indexing endpoints
│   ├── services/            # Business logic
│   │   ├── supabase.py      # Supabase client
│   │   ├── embeddings.py    # Embedding generation
│   │   ├── vector_search.py # Vector similarity search
│   │   └── rag.py           # RAG pipeline
│   └── models/              # Pydantic models
│       ├── chat.py
│       └── document.py
├── supabase/
│   └── migrations/          # Database migrations
├── pyproject.toml           # Poetry dependencies
├── Dockerfile               # Container configuration
├── .env.example             # Environment variables template
└── README.md
```

## Prerequisites

- Python 3.11+
- Poetry for dependency management
- Supabase project (free tier available)
- OpenAI API key

## Setup

### 1. Install Dependencies

```bash
cd apps/pnld-ai-service
poetry install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Service role key from Supabase
- `SUPABASE_ANON_KEY`: Anon public key from Supabase
- `OPENAI_API_KEY`: Your OpenAI API key

### 3. Set Up Supabase Database

#### Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (free tier available)
3. Wait for the project to be ready
4. Get your project URL and keys from Settings > API

#### Run Migrations

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

Alternatively, you can run the migration SQL directly in the Supabase SQL Editor:
- Go to your Supabase Dashboard > SQL Editor
- Copy the content from `supabase/migrations/20250101000000_initial_schema.sql`
- Run the SQL

#### Enable pgvector Extension

The migration file automatically enables the pgvector extension, but verify it's enabled:

1. Go to Database > Extensions in Supabase Dashboard
2. Search for "vector"
3. Enable if not already enabled

## Running the Service

### Development Mode

```bash
poetry run uvicorn app.main:app --reload --port 8000
```

Or using Python directly:

```bash
poetry run python -m app.main
```

The service will be available at:
- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/api/v1/health`

### Docker

#### Building the Docker Image

The Dockerfile uses a multi-stage build for optimal image size and includes configurations for reproducible builds:

```bash
docker build -t pnld-ai-service .
```

**Reproducibility Features:**
- `poetry.lock` is included in the build (not excluded by .dockerignore) to ensure exact dependency versions
- pip and setuptools are pinned to specific versions (pip==24.3.1, setuptools==75.6.0)
- Poetry validates the lockfile with `poetry check --lock` during build
- Environment variables ensure consistent Poetry behavior:
  - `POETRY_VIRTUALENVS_IN_PROJECT=true`
  - `POETRY_NO_INTERACTION=1`
  - `POETRY_VIRTUALENVS_CREATE=false`

**Build Process:**
1. **Builder stage**: Installs Poetry and dependencies using poetry.lock
2. **Runtime stage**: Copies installed packages and application code, runs as non-root user

**Verifying the Build:**

Check if poetry.lock is being used:
```bash
docker build --progress=plain -t pnld-ai-service . 2>&1 | grep "poetry.lock"
```

Run the container:

```bash
docker run -p 8000:8000 --env-file .env pnld-ai-service
```

**CI/CD:**
The GitHub Actions workflow includes a Docker build smoke test that verifies the image builds successfully with deterministic dependencies. See `.github/workflows/ci.yml` for details.

## API Endpoints

### Health Checks

- `GET /api/v1/health` - Service health status
- `GET /api/v1/health/supabase` - Supabase connection status

### Chat

- `POST /api/v1/chat` - Send a chat message and get AI response
- `GET /api/v1/chat/{conversation_id}` - Get conversation history

### Documents

- `POST /api/v1/documents/index` - Index a new document
- `GET /api/v1/documents/{document_id}` - Get document details
- `DELETE /api/v1/documents/{document_id}` - Delete a document

## Development

### Running Tests

```bash
poetry run pytest
```

### Code Formatting

```bash
poetry run black app/
poetry run ruff check app/
```

### Type Checking

```bash
poetry run mypy app/
```

## Deployment

This service is designed to be deployed separately from the frontend (not on Vercel). Recommended platforms:

- **Railway**: Easy deployment with automatic CI/CD
- **Fly.io**: Global edge deployment
- **Google Cloud Run**: Serverless container deployment
- **AWS ECS/Fargate**: Enterprise-grade deployment

### Deployment Checklist

- [ ] Set up Supabase project and run migrations
- [ ] Configure environment variables in deployment platform
- [ ] Enable pgvector extension in Supabase
- [ ] Set up OpenAI API key
- [ ] Configure CORS origins for your frontend domain
- [ ] Set up monitoring and logging
- [ ] Configure health check endpoint in platform

## Database Schema

The service uses four main tables:

1. **pnld_documents**: Stores PNLD edital documents
2. **pnld_embeddings**: Stores vector embeddings for similarity search
3. **chat_conversations**: Stores conversation metadata
4. **chat_messages**: Stores individual chat messages

See `supabase/migrations/20250101000000_initial_schema.sql` for the complete schema.

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `ENVIRONMENT` | Runtime environment | `development`, `production` |
| `PORT` | Server port | `8000` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:3000` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJ...` |
| `SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `OPENAI_MODEL` | OpenAI chat model | `gpt-4-turbo-preview` |
| `OPENAI_EMBEDDING_MODEL` | OpenAI embedding model | `text-embedding-3-small` |

## Logging and Observability

The service implements structured logging with request tracing. All components use a centralized logging configuration that provides:

- Request ID tracking across all operations
- Conversation ID tracking for chat endpoints
- Structured log formats (JSON in production, human-readable in development)
- Contextual metadata for debugging

See [LOGGING_OBSERVABILITY.md](./LOGGING_OBSERVABILITY.md) for detailed documentation on:
- Logging best practices
- Error handling patterns
- Conversation state management
- Monitoring and alerting strategies

## Troubleshooting

### Common Issues

**Issue**: Health check fails with Supabase connection error

**Solution**: Verify your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct and the database is accessible.

---

**Issue**: Vector search returns no results

**Solution**: Ensure pgvector extension is enabled and documents have been indexed with embeddings.

---

**Issue**: OpenAI API rate limit errors

**Solution**: Implement rate limiting in your application or upgrade your OpenAI plan.

---

**Issue**: Logs not appearing or missing context

**Solution**: Check [LOGGING_OBSERVABILITY.md](./LOGGING_OBSERVABILITY.md) for logging configuration and troubleshooting.

## Documentation

- [LOGGING_OBSERVABILITY.md](./LOGGING_OBSERVABILITY.md) - Logging and observability documentation
- [QUERY_OPTIMIZATIONS.md](./QUERY_OPTIMIZATIONS.md) - Database query performance improvements
- [CONTAINER_REPRODUCIBILITY.md](./CONTAINER_REPRODUCIBILITY.md) - Docker build reproducibility

## License

Part of the Mok Labs monorepo.
