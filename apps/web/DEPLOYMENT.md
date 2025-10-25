# Deployment Guide

## Environment Variables Configuration

### Vercel Deployment

To deploy the frontend to Vercel with the PNLD AI Service integration, you need to configure the following environment variables:

#### Required Environment Variables

1. **NEXT_PUBLIC_PNLD_AI_SERVICE_URL**
   - **Value**: `https://pnld-ai-service.fly.dev`
   - **Description**: URL of the PNLD AI backend service hosted on Fly.io
   - **Scope**: Production, Preview, Development

#### Setting Environment Variables in Vercel

**Option 1: Via Vercel Dashboard**

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the variable:
   - **Name**: `NEXT_PUBLIC_PNLD_AI_SERVICE_URL`
   - **Value**: `https://pnld-ai-service.fly.dev`
   - **Environments**: Select Production, Preview, and Development
4. Click **Save**

**Option 2: Via Vercel CLI**

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Set environment variable for production
vercel env add NEXT_PUBLIC_PNLD_AI_SERVICE_URL production

# When prompted, enter: https://pnld-ai-service.fly.dev

# Set for preview environments
vercel env add NEXT_PUBLIC_PNLD_AI_SERVICE_URL preview

# Set for development
vercel env add NEXT_PUBLIC_PNLD_AI_SERVICE_URL development
```

**Option 3: Via `.env.production` file (committed to repo)**

Create `apps/web/.env.production`:
```bash
NEXT_PUBLIC_PNLD_AI_SERVICE_URL=https://pnld-ai-service.fly.dev
```

### Backend (Fly.io) Environment Variables

The following secrets are already configured on Fly.io for the backend service:

- ✅ `SUPABASE_URL` - Supabase project URL
- ✅ `SUPABASE_SERVICE_KEY` - Supabase service role key
- ✅ `OPENAI_API_KEY` - OpenAI API key for embeddings and chat
- ✅ `CORS_ORIGINS` - Allowed CORS origins (includes Vercel URL)
- ✅ `SUPABASE_ANON_KEY` - Supabase anonymous key

To view configured secrets:
```bash
cd apps/pnld-ai-service
flyctl secrets list
```

To add or update a secret:
```bash
flyctl secrets set SECRET_NAME=value
```

#### CORS Configuration

The backend is configured to accept requests from the following origins:

```bash
CORS_ORIGINS=https://moklabs-landing.vercel.app,http://localhost:3000,http://127.0.0.1:3000
```

**CORS Middleware Settings** (configured in `apps/pnld-ai-service/app/main.py`):
- ✅ `allow_origins`: Parsed from CORS_ORIGINS env var
- ✅ `allow_credentials`: true
- ✅ `allow_methods`: ["*"] (all methods)
- ✅ `allow_headers`: ["*"] (all headers)
- ✅ `max_age`: 600 seconds

**Testing CORS Configuration:**

Test preflight request:
```bash
curl -i -X OPTIONS https://pnld-ai-service.fly.dev/api/v1/health \
  -H "Origin: https://moklabs-landing.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```

Expected response headers:
```
access-control-allow-origin: https://moklabs-landing.vercel.app
access-control-allow-credentials: true
access-control-allow-methods: DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT
```

**Adding New Origins:**

To add a new origin (e.g., custom domain or staging environment):
```bash
cd apps/pnld-ai-service
flyctl secrets set CORS_ORIGINS="https://moklabs-landing.vercel.app,https://your-new-domain.com,http://localhost:3000"
```

This will trigger a rolling update of all machines.

### Local Development

For local development, use `.env.local`:

```bash
# apps/web/.env.local
NEXT_PUBLIC_PNLD_AI_SERVICE_URL=http://localhost:8000
```

Make sure the backend is running locally:
```bash
cd apps/pnld-ai-service
python -m uvicorn app.main:app --reload --port 8000
```

## Verification

After configuring environment variables:

1. **Verify backend is accessible**:
   ```bash
   curl https://pnld-ai-service.fly.dev/api/v1/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "service": "PNLD AI Service",
     "version": "0.1.0",
     "timestamp": "..."
   }
   ```

2. **Test PNLD Chat feature** on deployed site
   - Navigate to `/pnld-chat`
   - Send a test message
   - Verify response is received

3. **Check Vercel deployment logs** for any environment variable issues

## Troubleshooting

### Backend not responding
- Check if Fly.io machines are running: `flyctl status`
- Machines auto-start on first request (may take 3-5 seconds)
- Check Fly.io logs: `flyctl logs`

### CORS errors
- Verify `CORS_ORIGINS` includes your Vercel deployment URL
- Current configured origins: `https://moklabs-landing.vercel.app,http://localhost:3000,http://127.0.0.1:3000`
- Test CORS preflight: See "Testing CORS Configuration" section above
- Update with: `flyctl secrets set CORS_ORIGINS="https://moklabs-landing.vercel.app,http://localhost:3000,http://127.0.0.1:3000"`
- Note: Updating secrets triggers automatic rolling deployment

### Environment variable not updating
- Vercel requires redeployment after changing environment variables
- Trigger a new deployment or redeploy from dashboard
