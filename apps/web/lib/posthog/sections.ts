/**
 * Shared section identifiers for `section_viewed` PostHog events.
 *
 * Every page-level landing section that wraps its content with
 * <SectionTracker section={SECTION.X}> must use a name from here so
 * PostHog funnels compare like-with-like across `/` and `/pnld`.
 */

export const SECTION = {
  HERO: "hero",
  PROBLEM: "problem",
  SERVICES: "services",
  HOW_WORKS: "how-works",
  CTA_BANNER: "cta-banner",
  OUR_WAY: "our-way",
  ANIMATED_PANEL: "animated-panel",
  FAQ: "faq",
  CONTACT: "contact",
  BLOG: "blog",
} as const;

export type SectionName = (typeof SECTION)[keyof typeof SECTION];
