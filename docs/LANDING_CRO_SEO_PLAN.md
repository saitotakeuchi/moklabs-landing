# Landing Pages — CRO / SEO / Lead-Gen Plan

**Scope**: `moklabs.com.br/` and `moklabs.com.br/pnld`
**Created**: 2026-04-19
**Owner**: @saito
**Status**: Sprint 1 shipped on `staging`; Sprint 2 approved — in progress (2026-04-19)

This document is the reference for the ongoing initiative to improve conversion, SEO, and lead-generation on the Mok Labs marketing surface. It captures the critique that drove the sprint plan, the prioritization rationale, and links to each sprint's detailed task list.

---

## 1. Why this initiative

The site has a mature instrumentation foundation — PostHog with first/last-touch attribution, server-side conversion events that bypass ad-blockers, proper Next.js metadata API usage, dynamic sitemap — but the **funnel itself** is thin: a single WhatsApp destination, no social proof, no lead magnets, SVG OG images that don't render on social platforms, and no FAQ/Organization/Service schema to capture rich results.

We have traffic instrumentation without traffic leverage. This plan closes that gap in four sprints, sequenced so that diagnostic improvements ship before copy/design changes (so we can measure what works).

---

## 2. Audience & commercial context

- **Primary buyer**: Brazilian educational publishers (editoras) producing books for PNLD / FNDE programs.
- **Secondary**: Edtech companies commissioning digital learning objects, LMS/AVA, applied AI.
- **Conversion definitions**:
  - Hard: `lead_submitted` (contact form) or `lead_submitted_server` (PostHog server event)
  - Soft: `whatsapp_click` (currently uncaptured), lead-magnet download (not yet built), calendar booking (not yet built)
- **Traffic mix (inferred from attribution library)**: Google Ads (`gclid`), Meta (`fbclid`), Microsoft (`msclkid`), organic, direct. Brazilian audience skews strongly to WhatsApp on mobile.

---

## 3. What's already strong — do not disturb

| Asset                        | Location                                              | Why it's good                                                                                      |
| ---------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| First/last-touch attribution | `apps/web/lib/attribution.ts`                         | Captures UTMs, click IDs, referrer, landing path in sessionStorage; joined into contact payload    |
| Server-side conversion event | `apps/web/app/api/contact/route.ts:360`               | `captureServerEvent("lead_submitted_server")` bypasses ad-blockers, keeps Google Ads counts honest |
| Dynamic sitemap              | `apps/web/app/sitemap.ts`                             | Blog posts enumerated from MDX with per-post `lastModified`                                        |
| Blog `BlogPosting` JSON-LD   | `apps/web/app/blog/[slug]/page.tsx:188`               | Complete Article schema emitted per post                                                           |
| Route-level metadata         | `apps/web/app/page.tsx`, `apps/web/app/pnld/page.tsx` | Proper Next.js metadata API, canonical `alternates` set                                            |
| Consent-gated analytics      | `apps/web/components/common/CookieConsent.tsx:25`     | PostHog persistence upgrades from in-memory → localStorage only after opt-in                       |
| Font subsetting              | `apps/web/app/layout.tsx:17`                          | `next/font` with `display:swap`, Latin subset, variable CSS vars                                   |
| Form error UX                | `apps/web/components/forms/ContactForm.tsx`           | Per-field validation, AbortController 20s timeout, server error surfacing                          |

These are load-bearing. Any change that touches them needs to preserve the behavior.

---

## 4. Critique — findings summary

Full detail (with file + line refs) lives in each sprint doc. This section is the index.

### P0 — Broken / production-quality bugs

| #    | Finding                                                                                              | Ships in |
| ---- | ---------------------------------------------------------------------------------------------------- | -------- |
| P0-1 | Homepage hero image (`main-lp-hero.svg`) deleted from repo, still referenced by `mainContent.ts:4`   | Sprint 1 |
| P0-2 | OG image is `/og-image.svg` — WhatsApp/Facebook/LinkedIn/Twitter do NOT render SVG for link previews | Sprint 1 |
| P0-3 | Homepage hero has no subtitle/lede; component doesn't even support one                               | Sprint 2 |
| P0-4 | Contact form has zero `<label>` elements; placeholders act as labels (a11y + SEO penalty)            | Sprint 1 |
| P0-5 | Dead `SEOHead.tsx` re-exported in barrel, waiting to be misused                                      | Sprint 1 |

### P1 — High-impact SEO gaps

| #     | Finding                                                                              | Ships in |
| ----- | ------------------------------------------------------------------------------------ | -------- |
| P1-11 | No Organization / WebSite JSON-LD on `/` or `/pnld` (exists only on blog slug)       | Sprint 1 |
| P1-12 | No FAQPage JSON-LD despite 5+ Q/A pairs per page                                     | Sprint 1 |
| P1-13 | No Service JSON-LD on `/pnld`                                                        | Sprint 2 |
| P1-14 | No BreadcrumbList JSON-LD on blog slug pages (visual breadcrumb exists w/o schema)   | Sprint 1 |
| P1-15 | Thin content on `/pnld` — ~500 words total body copy                                 | Sprint 3 |
| P1-16 | No per-edital landing pages (PNLD 2025, 2026, 2028 all conflate to one page)         | Sprint 3 |
| P1-17 | Canonical URL inconsistency — `seoConfig.home.url` has trailing slash, others don't  | Sprint 1 |
| P1-18 | Alt text is English and generic (`"Digital solutions illustration"`) on a PT-BR site | Sprint 1 |
| P1-19 | `keywords` meta populated — Google ignored since 2009, Bing treats as spam signal    | Sprint 1 |
| P1-20 | No retargeting pixels (Meta, LinkedIn Insight for B2B editora buyers)                | Sprint 4 |
| P1-21 | No Search Console / Bing Webmaster verification strings committed                    | Sprint 4 |

### P1 — High-impact conversion gaps

| #     | Finding                                                                                 | Ships in |
| ----- | --------------------------------------------------------------------------------------- | -------- |
| P1-1  | Zero social proof (no logos, testimonials, metrics, case studies) anywhere              | Sprint 3 |
| P1-2  | WhatsApp CTAs are cold — no prefilled text, no UTM, no PostHog click event              | Sprint 1 |
| P1-3  | Single destination for all CTAs (WhatsApp); no lower-friction path                      | Sprint 3 |
| P1-4  | No sticky mobile WhatsApp button (BR mobile audience expects this)                      | Sprint 2 |
| P1-5  | Hero copy is brand-poetry, not outcome — no timeline, no approval-rate, no fear-of-loss | Sprint 2 |
| P1-6  | `/pnld` H1 at 98px — extreme, hurts LCP and comprehension                               | Sprint 2 |
| P1-7  | CTA button copy is monotonous ("Vamos conversar!" × N) — no variants, no tracking       | Sprint 2 |
| P1-8  | Contact form has no context: CTAs jump to `#contato` without pre-selecting the service  | Sprint 2 |
| P1-9  | FAQ answers don't funnel — no internal links to blog or contact anchor                  | Sprint 2 |
| P1-10 | No scroll-depth or intent PostHog events — funnel is opaque between pageview and submit | Sprint 2 |

### P2 — Polish / long-tail

P2-1 through P2-10 + design-craft notes: see `sprint_04_tasks.md`.

---

## 5. Prioritization rationale

Four sprints sequenced by **dependency** and **information value**, not just impact.

1. **Sprint 1 — Foundations & Quick Wins.** Fix broken things, ship schemas, make WhatsApp measurable. _Rationale: instrumentation before optimization. If we change hero copy in Sprint 2 without `whatsapp_click` events, we can't tell if the new copy moves the needle._
2. **Sprint 2 — Conversion Mechanics.** Copy, CTAs, form context, mobile sticky, scroll events. _Rationale: with Sprint 1 shipped, every change here is measurable against a baseline._
3. **Sprint 3 — Social Proof & Lead Diversification.** Logos, testimonials, metrics, lead magnet, Cal.com, Copiloto promotion, per-edital landing pages. _Rationale: content-heavy work that requires internal alignment (legal on testimonials, design on PDF, marketing on case studies). Parallelizable with engineering but longer wall-time._
4. **Sprint 4 — Polish, Growth Channels, Deep Instrumentation.** Retargeting pixels, blog post CTAs, author bylines, a11y polish, consent granularity, performance pass. _Rationale: most of these are invisible-but-compounding (pixels build audiences you retarget weeks later; author bylines raise E-E-A-T signal; a11y compounds into SEO)._

---

## 6. Success metrics

Baselines must be snapshotted before Sprint 1 ships. Proposed KPIs:

| Metric                                                       | Source                     | Target after Sprint 4         |
| ------------------------------------------------------------ | -------------------------- | ----------------------------- |
| `lead_submitted` / week                                      | PostHog                    | +30% vs. 4-week baseline      |
| `whatsapp_click` / week                                      | PostHog (new)              | Measurable for the first time |
| Form completion rate (`lead_form_viewed` → `lead_submitted`) | PostHog                    | +10 pp                        |
| Organic search impressions for `/pnld`                       | GSC                        | +50%                          |
| Rich-result eligibility (FAQ, Breadcrumb, Organization)      | GSC enhancements           | 100% of applicable pages      |
| Lighthouse Performance mobile (`/pnld`)                      | local / PageSpeed Insights | ≥85                           |
| Lighthouse SEO mobile                                        | same                       | 100                           |
| Lighthouse Accessibility mobile                              | same                       | ≥95                           |

Track weekly; don't chase daily noise.

---

## 7. Sprint index

| Sprint | Status                 | Focus                                                                                                                                             | Doc                                        |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1      | Shipped (staging)      | Foundations: P0 bugs, JSON-LD schemas, OG image, WhatsApp instrumentation, alt text, canonical                                                    | [sprint_01_tasks.md](./sprint_01_tasks.md) |
| 2      | Approved — in progress | Conversion mechanics: hero copy, CTA variants, sticky mobile, form context, service taxonomy, scroll events, H1 cap, Service schema, lead scoring | [sprint_02_tasks.md](./sprint_02_tasks.md) |
| 3      | Planned                | Social proof & lead diversification: logos, testimonials, metrics, lead magnet, Cal.com, Copiloto, per-edital landing                             | [sprint_03_tasks.md](./sprint_03_tasks.md) |
| 4      | Planned                | Polish & growth: retargeting pixels, blog CTAs, author byline, a11y, consent granularity, performance, LocalBusiness                              | [sprint_04_tasks.md](./sprint_04_tasks.md) |

---

## 8. Explicitly out of scope

- Full site redesign or framework change.
- Internationalization / hreflang (audience is BR-only; positioning is PT-BR only).
- Rewriting the attribution library — it's well-designed; extensions only.
- An A/B test framework — traffic volume is too low for statistical lift detection. Ship copy variants as straight changes; revisit after 3 months of stable lead flow.
- Dark mode / theme toggle — not requested, not on critical path.

---

## 9. Working agreement

- Each sprint doc is the source of truth for its scope. The master plan (this doc) does not duplicate task lists — changes to scope update the sprint doc.
- Tasks are checked off as they ship; sprint doc `## Status` section captures running state.
- Before closing a sprint, run the verification checklist in its doc end-to-end.
- Metrics review: weekly during a sprint; post-mortem at sprint close.
