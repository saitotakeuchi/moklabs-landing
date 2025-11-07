/**
 * Supabase Client for Client Components
 *
 * Use this client in client-side components (with "use client" directive)
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
