import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Only run Supabase auth on routes that actually require a session.
    // Everything else (marketing pages, blog, /api/contact, etc.) must not
    // depend on Supabase availability.
    "/admin",
    "/admin/:path*",
    "/pnld-chat/dashboard",
    "/pnld-chat/dashboard/:path*",
  ],
};
