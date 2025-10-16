# Vercel Monorepo Configuration Guide

## Issue Identified

After the monorepo migration, Vercel was deploying cached/old content because the build configuration was not properly set up for the monorepo structure.

## Changes Made

### 1. ✅ Updated `apps/web/vercel.json`

- **Added:** Monorepo-aware build commands that navigate to root and use Turborepo filters
- **Kept:** App-specific headers and security settings
- **Key settings:**
  ```json
  {
    "buildCommand": "cd ../.. && pnpm run build --filter=@moklabs/web",
    "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
    "framework": "nextjs"
  }
  ```
- **How it works:** When Root Directory is set to `apps/web`, these commands navigate back to monorepo root to run the build

### 2. ✅ Fixed pnpm Version Mismatch

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
   - Set to: **`apps/web`**
   - This tells Vercel to treat `apps/web` as the project root

3. **Build & Development Settings:**
   - Framework Preset: **Next.js**
   - Build Command: **Override** with `cd ../.. && pnpm run build --filter=@moklabs/web`
   - Install Command: **Override** with `cd ../.. && pnpm install --frozen-lockfile`
   - Output Directory: Leave as default (`.next`)

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

- **"Cannot find module '@moklabs/ui'"** → Build commands not navigating to monorepo root
- **"No Next.js version detected"** → Root Directory is NOT set to `apps/web`
- **Old content showing** → Build cache issue, clear cache and redeploy
- **Build fails silently** → Check install command is using pnpm, not npm
- **pnpm workspace errors** → Ensure Root Directory is `apps/web` so build commands can navigate to root

## Architecture

```
moklabs-landing/                  ← Monorepo root
├── pnpm-workspace.yaml           ← Workspace definition
├── turbo.json                    ← Turborepo config
├── package.json                  ← Root package.json
├── apps/
│   └── web/                      ← Vercel Root Directory (set to "apps/web")
│       ├── vercel.json           ← Build & deployment config
│       ├── package.json          ← @moklabs/web (has Next.js)
│       ├── next.config.mjs
│       └── .next/                ← Build output
└── packages/
    ├── ui/
    ├── config/
    └── database/
```

**How it works:**
1. Vercel's Root Directory is set to `apps/web`
2. Build commands in `vercel.json` use `cd ../..` to navigate to monorepo root
3. From root, Turborepo builds all dependencies and the web app
4. Output goes to `apps/web/.next` (relative to Root Directory)

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
