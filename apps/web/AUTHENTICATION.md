# Admin Authentication Setup

This document explains how to set up and use authentication for admin routes in the Mok Labs application.

## Overview

The application uses **Supabase Authentication** to protect admin routes:

- `/admin` - Blog admin page
- `/pnld-chat/dashboard` - Document management dashboard

## Prerequisites

1. A Supabase project (free tier works)
2. Supabase credentials (URL and anon key)

## Setup Instructions

### 1. Configure Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from:

- Supabase Dashboard → Settings → API
- URL format: `https://[project-id].supabase.co`

### 2. Create Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password for your admin account
4. Click "Create user"

**Note**: Email verification is disabled by default in development. For production, configure email templates in Supabase.

### 3. Test the Authentication

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Navigate to `/admin/login`

3. Sign in with your admin credentials

4. You should be redirected to `/pnld-chat/dashboard`

## Protected Routes

The following routes are automatically protected by middleware:

### Admin Routes

- `/admin` - Main admin page
- `/admin/*` - All admin sub-routes (except `/admin/login`)

### Dashboard Routes

- `/pnld-chat/dashboard` - Document management interface

### Login Page

- `/admin/login` - Public login page

## Authentication Flow

### Login

1. User visits protected route (e.g., `/pnld-chat/dashboard`)
2. Middleware checks authentication status
3. If not authenticated → redirect to `/admin/login?redirectTo=/pnld-chat/dashboard`
4. User enters credentials
5. On success → redirect to original destination

### Logout

1. User clicks "Logout" button in dashboard header
2. Session is cleared
3. User is redirected to `/admin/login`

## Architecture

### Client-Side Auth

- **Location**: `lib/supabase/client.ts`
- **Usage**: Client components with `"use client"` directive
- **Features**: Real-time auth state, session management

### Server-Side Auth

- **Location**: `lib/supabase/server.ts`
- **Usage**: Server components, API routes, server actions
- **Features**: Secure cookie-based auth

### Middleware Auth

- **Location**: `lib/supabase/middleware.ts`
- **Usage**: Route protection in `middleware.ts`
- **Features**: Automatic session refresh, route guarding

### Auth Context

- **Location**: `contexts/AuthContext.tsx`
- **Usage**: Provides auth state and methods to components
- **Methods**: `user`, `loading`, `signOut()`

## User Management

### Creating Additional Users

Use the Supabase Dashboard:

1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. User can now log in

### User Metadata (Optional)

Add custom metadata to users for role-based access:

```typescript
// In Supabase Dashboard → Authentication → User → Raw user meta data
{
  "role": "admin",
  "permissions": ["documents", "editais"]
}
```

Access in your app:

```typescript
const { user } = useAuth();
const userRole = user?.user_metadata?.role;
```

## Security Features

✅ **Session-based authentication** with secure HTTP-only cookies
✅ **Automatic session refresh** via middleware
✅ **Protected routes** via Next.js middleware
✅ **CSRF protection** built into Supabase Auth
✅ **XSS protection** via HTTP-only cookies

## Troubleshooting

### "Invalid authentication credentials"

- Check that environment variables are set correctly
- Verify Supabase URL and anon key
- Ensure user exists in Supabase Dashboard

### Redirect loop on login

- Clear browser cookies
- Check middleware configuration
- Verify Supabase project is active

### User not persisting after login

- Check browser console for errors
- Verify cookies are enabled in browser
- Check Supabase project quotas

### "Not authenticated" error

- Session may have expired (default: 1 hour)
- User needs to log in again
- Check Supabase Dashboard → Authentication → Settings for session timeout

## Production Deployment

### Environment Variables

Ensure production environment has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

### Email Configuration

1. Configure email templates in Supabase Dashboard
2. Set up custom SMTP (optional)
3. Enable email verification for production

### Security Checklist

- [ ] Use strong passwords for admin users
- [ ] Enable email verification
- [ ] Configure password policies in Supabase
- [ ] Set up proper CORS policies
- [ ] Enable RLS (Row Level Security) in Supabase
- [ ] Monitor authentication logs

## API Reference

### useAuth Hook

```typescript
import { useAuth } from '@/contexts/AuthContext';

function Component() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Logged in as: {user.email}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### Server-Side Auth Check

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function ServerComponent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return <div>Welcome {user.email}</div>;
}
```

## Support

For issues or questions:

1. Check Supabase documentation: https://supabase.com/docs/guides/auth
2. Review this authentication guide
3. Check application logs and browser console

## Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
