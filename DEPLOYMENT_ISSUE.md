# 🚨 Vercel Deployment Issue - Incorrect Build Output Path

## Problem Summary

**Staging deployment is not serving the application correctly:**
- Main staging URL shows blank/empty page (nothing loads)
- `index.html` file is being output to wrong location: `/server/app` instead of root
- Application is not accessible at the expected URL

## Environment

- **Project Structure:** Turborepo monorepo with pnpm workspaces
- **Framework:** Next.js 14.2.33 (App Router)
- **Package Manager:** pnpm 10.18.3
- **Deployment Platform:** Vercel
- **Branch:** staging

## Root Cause Analysis

After migrating to monorepo structure, Vercel deployment configuration is not correctly handling the build output path for Next.js when building from monorepo root.

### Current Configuration Issues:

1. **Vercel Root Directory:** Set to `apps/web` (correct)
2. **Build Command:** `cd ../.. && pnpm run build --filter=@moklabs/web` (navigates to monorepo root)
3. **Missing Output Directory Configuration:** No explicit `outputDirectory` in `vercel.json`
4. **Build Output Location Mismatch:** Vercel is misidentifying Next.js build output location

## Current File Structure

```
moklabs-landing/                      # Monorepo root
├── pnpm-workspace.yaml
├── turbo.json
├── package.json                      # Has turbo, NOT next
├── apps/
│   └── web/                          # Vercel Root Directory
│       ├── vercel.json               # Current config
│       ├── package.json              # Has next: "14.2.33"
│       ├── next.config.mjs
│       ├── app/                      # Next.js App Router
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── ...
│       └── .next/                    # Build output (should be here)
└── packages/
    ├── ui/
    ├── config/
    └── database/
```

## Current Configuration Files

### `apps/web/vercel.json`
```json
{
  "buildCommand": "cd ../.. && pnpm run build --filter=@moklabs/web",
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "headers": [...],
  "redirects": [],
  "rewrites": [],
  "crons": []
}
```

### `apps/web/package.json` (build script)
```json
{
  "scripts": {
    "build": "next build"
  }
}
```

### `turbo.json`
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    }
  }
}
```

## Expected vs Actual Behavior

### Expected:
- Build runs: `pnpm run build --filter=@moklabs/web`
- Turborepo builds dependencies (`@moklabs/ui`, `@moklabs/config`, `@moklabs/database`)
- Next.js builds in `apps/web/` → outputs to `apps/web/.next/`
- Vercel serves from `apps/web/.next/` (relative to Root Directory `apps/web`)
- Application loads correctly at staging URL

### Actual:
- Build completes without errors
- `index.html` appears in wrong location: `/server/app`
- Staging URL shows blank page (nothing renders)
- Application is not accessible

## Task for Engineer

### Objective
Fix Vercel deployment configuration so that Next.js application builds correctly and serves from proper location in monorepo setup.

### Required Actions

1. **Verify Vercel Dashboard Settings:**
   - Root Directory = `apps/web` ✓
   - Framework Preset = Next.js ✓
   - Node.js Version = 20.x

2. **Fix Build Output Configuration:**
   - Determine why Next.js output is going to `/server/app`
   - Configure correct output directory in `vercel.json`
   - Ensure Vercel recognizes `.next/` build output relative to Root Directory

3. **Test Build Locally:**
   ```bash
   cd moklabs-landing
   pnpm install --frozen-lockfile
   pnpm run build --filter=@moklabs/web
   # Verify output is in apps/web/.next/
   ```

4. **Update `vercel.json` with correct configuration:**
   - May need to add explicit `outputDirectory` or remove `buildCommand` override
   - Consider if Turborepo filter is causing path issues
   - Evaluate alternative approaches:
     - Option A: Let Vercel auto-detect (remove custom buildCommand)
     - Option B: Build directly without navigating to root
     - Option C: Use different Turborepo output configuration

5. **Potential Solutions to Test:**

   **Option 1:** Remove custom build command, let Vercel auto-detect
   ```json
   {
     "framework": "nextjs",
     "installCommand": "cd ../.. && pnpm install --frozen-lockfile"
   }
   ```

   **Option 2:** Build from apps/web without navigating to root
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "pnpm run build",
     "installCommand": "cd ../.. && pnpm install --frozen-lockfile"
   }
   ```

   **Option 3:** Use turbo directly from root with explicit output
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "cd ../.. && pnpm turbo build --filter=@moklabs/web",
     "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
     "outputDirectory": ".next"
   }
   ```

   **Option 4:** Build from root but specify working directory
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "cd ../.. && pnpm --filter @moklabs/web run build",
     "installCommand": "cd ../.. && pnpm install --frozen-lockfile"
   }
   ```

6. **Verify Fix:**
   - Push changes to staging branch
   - Monitor Vercel build logs for:
     - Successful dependency installation
     - Workspace resolution
     - Next.js build completion
     - Correct output directory detection
   - Confirm staging URL loads correctly
   - Verify all routes work (home, blog, PNLD, etc.)

### Success Criteria

- [ ] Staging deployment completes without errors
- [ ] Build output is in correct location (apps/web/.next/)
- [ ] Staging URL loads the application correctly
- [ ] All routes are accessible (/, /blog, /pnld, /politica-de-privacidade)
- [ ] No build cache issues
- [ ] Deployment is reproducible

### Related Files

- `apps/web/vercel.json` - Vercel deployment configuration
- `apps/web/next.config.mjs` - Next.js configuration
- `turbo.json` - Turborepo configuration
- `pnpm-workspace.yaml` - Workspace definition
- `VERCEL_MONOREPO_SETUP.md` - Documentation of current setup

### Additional Context

- This issue started after migrating from single Next.js app to Turborepo monorepo
- Local development works correctly (`pnpm dev`)
- GitHub Actions CI/CD builds pass successfully
- Issue is specific to Vercel deployment platform
- pnpm version mismatch has been resolved (all workflows use 10.18.3)

### Questions to Answer

1. Why is `index.html` appearing in `/server/app`?
2. Is Vercel correctly detecting Next.js App Router vs Pages Router?
3. Is the Turborepo filter causing output path issues?
4. Should we build from root or from apps/web?
5. Do we need explicit `outputDirectory` configuration?

---

**Priority:** P0 - Critical (Staging deployment broken)
**Assignee:** [Engineer Name]
**Created:** October 16, 2025
**Status:** Open

