# PNLD Chat App - Deprecated Standalone Version

**⚠️ Note: This standalone app is deprecated as of October 16, 2025**

## Current Architecture

The PNLD Chat application has been integrated into the main `@moklabs/web` app for better SEO and simpler deployment.

### Where to Find PNLD Chat Code

All PNLD Chat routes are now located at:
```
apps/web/app/pnld-chat/
```

### Routes

The chat application is accessible under the `/pnld-chat` path:
- `moklabs.com.br/pnld-chat` - Main chat page
- `moklabs.com.br/pnld-chat/auth` - Authentication
- `moklabs.com.br/pnld-chat/dashboard` - Dashboard
- `moklabs.com.br/pnld-chat/api` - API routes

### Why This Change?

**SEO Benefits:**
- Consolidates domain authority under moklabs.com.br
- Better for internal linking and site structure
- Unified analytics and tracking
- Single SSL certificate and security configuration

### Development

To work on the PNLD Chat features:

1. Navigate to `apps/web/app/pnld-chat/`
2. Make changes to the relevant files
3. Run `pnpm run dev` from the root to test (starts on port 3000)
4. Access the chat app at `http://localhost:3000/pnld-chat`

### Deployment

The PNLD Chat routes are automatically deployed with the main web app to Vercel. No separate deployment configuration needed.

---

**Status:** This standalone app directory is kept for reference but is no longer built or deployed.
