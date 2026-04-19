/**
 * Server-side PostHog client.
 *
 * Used from API routes to capture events that would otherwise be dropped by
 * browser ad-blockers (most notably `lead_submitted`). Keep a module-level
 * lazy singleton so we don't re-instantiate the client on every request.
 */

import { PostHog } from "posthog-node";

let client: PostHog | null = null;

function getKey(): string | undefined {
  return (
    process.env.POSTHOG_PROJECT_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY
  );
}

function getHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
}

export function getPostHogServer(): PostHog | null {
  if (client) return client;

  const key = getKey();
  if (!key) return null;

  client = new PostHog(key, {
    host: getHost(),
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
}

/**
 * Capture an event server-side and flush immediately so it lands even if the
 * serverless function is torn down right after returning.
 */
export async function captureServerEvent(args: {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}): Promise<void> {
  const ph = getPostHogServer();
  if (!ph) return;

  ph.capture({
    distinctId: args.distinctId,
    event: args.event,
    properties: args.properties,
  });

  try {
    await ph.flush();
  } catch {
    // Never let analytics break the request path.
  }
}
