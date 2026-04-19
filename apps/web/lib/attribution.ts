/**
 * Marketing attribution capture.
 *
 * Reads UTM params, gclid/fbclid/msclkid, referrer and landing path on first
 * browser paint and persists them in sessionStorage so the contact form can
 * attach them to the lead submission.
 *
 * Two records are kept:
 *   - first-touch: set once per session, never overwritten
 *   - last-touch:  overwritten every time a new attributed landing is detected
 *
 * Reason: sessionStorage scope matches the window-session mental model most
 * ad platforms assume for conversion attribution.
 */

const FIRST_KEY = "moklabs_attribution_first";
const LAST_KEY = "moklabs_attribution_last";

export interface AttributionTouch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  referrer?: string;
  landing_path?: string;
  landing_timestamp?: string;
}

export interface Attribution {
  first: AttributionTouch | null;
  last: AttributionTouch | null;
}

const TRACKED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
] as const;

function readTouch(): AttributionTouch {
  const params = new URLSearchParams(window.location.search);
  const touch: AttributionTouch = {
    landing_path: window.location.pathname,
    landing_timestamp: new Date().toISOString(),
  };

  for (const key of TRACKED_PARAMS) {
    const value = params.get(key);
    if (value) touch[key] = value;
  }

  const referrer = document.referrer;
  if (referrer && !referrer.startsWith(window.location.origin)) {
    touch.referrer = referrer;
  }

  return touch;
}

function hasAttribution(touch: AttributionTouch): boolean {
  return (
    TRACKED_PARAMS.some((key) => Boolean(touch[key])) || Boolean(touch.referrer)
  );
}

function safeRead(key: string): AttributionTouch | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as AttributionTouch) : null;
  } catch {
    return null;
  }
}

function safeWrite(key: string, touch: AttributionTouch): void {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(touch));
  } catch {
    // sessionStorage can throw in private-mode browsers; ignore.
  }
}

/**
 * Call once on landing (client-side) to persist first/last-touch attribution.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  const touch = readTouch();

  if (!safeRead(FIRST_KEY)) {
    safeWrite(FIRST_KEY, touch);
  }

  if (hasAttribution(touch)) {
    safeWrite(LAST_KEY, touch);
  } else if (!safeRead(LAST_KEY)) {
    safeWrite(LAST_KEY, touch);
  }
}

/**
 * Read the persisted attribution, used by the contact form submit handler.
 */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") {
    return { first: null, last: null };
  }
  return {
    first: safeRead(FIRST_KEY),
    last: safeRead(LAST_KEY),
  };
}

/**
 * Flatten an Attribution object into a flat property bag suitable for PostHog
 * event properties. First-touch fields are prefixed with `first_` so they can
 * be aggregated alongside last-touch (the default) in dashboards.
 */
export function flattenAttribution(
  attribution: Attribution
): Record<string, string> {
  const flat: Record<string, string> = {};
  const { first, last } = attribution;

  if (last) {
    for (const [key, value] of Object.entries(last)) {
      if (typeof value === "string" && value) flat[key] = value;
    }
  }
  if (first) {
    for (const [key, value] of Object.entries(first)) {
      if (typeof value === "string" && value) flat[`first_${key}`] = value;
    }
  }
  return flat;
}
