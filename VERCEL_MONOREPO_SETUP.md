# Vercel Monorepo Configuration Guide

## Issue Identified

After the monorepo migration, Vercel was deploying cached/old content because the build configuration was not properly set up for the monorepo structure.

## Changes Made

### 1. ✅ Created Root-Level `vercel.json`

- **Location:** `moklabs-landing/vercel.json`
- **Purpose:** Configures Vercel to build from the monorepo root using Turborepo filters
- **Key settings:**
  ```json
  {
    "buildCommand": "pnpm run build --filter=@moklabs/web",
    "devCommand": "pnpm run dev --filter=@moklabs/web",
    "installCommand": "pnpm install",
    "framework": "nextjs",
    "outputDirectory": "apps/web/.next",
    "regions": ["gru1"]
  }
  ```

### 2. ✅ Updated `apps/web/vercel.json`

- **Removed:** Build-related configuration (moved to root)
- **Kept:** App-specific headers and security settings
- **Purpose:** Avoid configuration conflicts

### 3. ✅ Fixed pnpm Version Mismatch

Updated all GitHub Actions workflows to use `pnpm@10.18.3` (matching `package.json`):

- `.github/workflows/deploy.yml`
- `.github/workflows/staging-deploy.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/pr-checks.yml`
- `.github/workflows/pr-preview.yml`

## Required Vercel Dashboard Configuration

⚠️ **CRITICAL:** You MUST update these settings in your Vercel project dashboard:

### For Both Production and Staging Deployments:

1. **Go to:** Vercel Dashboard → Your Project → Settings → General

2. **Root Directory:**
   - Set to: **`.`** (dot - meaning monorepo root)
   - OR leave **blank** (defaults to root)
   - ❌ Do NOT set to `apps/web`

3. **Build & Development Settings:**
   - Framework Preset: **Next.js**
   - Build Command: **Override** with `pnpm run build --filter=@moklabs/web`
   - Output Directory: `apps/web/.next`
   - Install Command: `pnpm install`

4. **Node.js Version:**
   - Set to: **20.x** (for consistency)

5. **Environment Variables:**
   Ensure these are set (if needed):
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SITE_NAME`
   - Any other env vars your app needs

## How to Verify the Fix

1. **Push changes to staging branch:**

   ```bash
   git add .
   git commit -m "fix: Configure Vercel for monorepo structure"
   git push origin staging
   ```

2. **Monitor the deployment:**
   - Go to Vercel Dashboard → Deployments
   - Watch the build logs
   - Look for: `pnpm run build --filter=@moklabs/web`
   - Verify it installs all workspace dependencies

3. **Check the deployed site:**
   - Visit your staging URL
   - Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
   - Verify your latest changes are visible

4. **Check the build output:**
   - In Vercel logs, look for successful builds of:
     - `@moklabs/config`
     - `@moklabs/database`
     - `@moklabs/ui`
     - `@moklabs/web`

## Troubleshooting

### If builds still fail or show old content:

1. **Clear Vercel build cache:**
   - Dashboard → Settings → Clear Build Cache

2. **Redeploy:**
   - Dashboard → Deployments → Click "..." → Redeploy

3. **Check build logs for errors:**
   - Look for workspace resolution errors
   - Check if `packages/*` are being built
   - Verify pnpm version is 10.18.3

### Common Issues:

- **"Cannot find module '@moklabs/ui'"** → Root Directory is set to `apps/web` instead of root
- **Old content showing** → Build cache issue, clear cache and redeploy
- **Build fails silently** → Check install command is using pnpm, not npm

## Architecture

```
moklabs-landing/                  ← Vercel Root Directory (set to ".")
├── vercel.json                   ← Build configuration
├── pnpm-workspace.yaml           ← Workspace definition
├── turbo.json                    ← Turborepo config
├── package.json                  ← Root package.json
├── apps/
│   └── web/
│       ├── vercel.json           ← App-specific config (headers only)
│       ├── package.json          ← @moklabs/web
│       ├── next.config.mjs
│       └── .next/                ← Build output
└── packages/
    ├── ui/
    ├── config/
    └── database/
```

## Next Steps

1. ✅ Commit and push these changes
2. ⚠️ Update Vercel Dashboard settings (see above)
3. ✅ Test staging deployment
4. ✅ Verify latest content is showing
5. ✅ Once staging works, repeat for production project (if separate)

---

**Last Updated:** October 16, 2025
**Issue:** Staging deployment showing cached/old files after monorepo migration
**Status:** Fixed - Pending Vercel dashboard configuration update
