# Sprint 2 — Conversion Mechanics

**Theme**: With Sprint 1's instrumentation in place, close the biggest CRO gaps: hero copy, CTA design, mobile sticky, form context, and intent tracking.
**Wall time**: ~1 week (est. 3–5 developer-days)
**Depends on**: Sprint 1 shipped on `staging` (commits through `3e147b8`). `WhatsAppLink`, `lib/whatsapp.ts`, `lib/seo/schemas.ts`, floating labels, canonical URLs, PNG OG, FAQPage + Organization + WebSite JSON-LD all live.
**Parent plan**: [LANDING_CRO_SEO_PLAN.md](./LANDING_CRO_SEO_PLAN.md)
**Status**: Approved — In Progress (2026-04-19)

## Why this sprint

Sprint 1 made the funnel visible. Sprint 2 reshapes it. Every change here should move either form-completion rate or WhatsApp click-through rate — both now measurable.

The less-obvious changes (service taxonomy canonicalization, scroll tracking, H1 cap) compound: they unlock diagnostic signal that Sprint 3's content work depends on, and they close a pre-existing data-quality bug where homepage services the visitor clicked didn't exist in the form's enum.

## Outcomes

- New hero copy on both `/` (broad portfolio positioning) and `/pnld` (outcome-shaped PNLD pitch).
- One canonical service taxonomy across `ServicesSection` displays + `ContactForm` enum + server validation — no more silent "Outros" fallthrough when a visitor clicks a specific service.
- Mobile visitors get a persistent WhatsApp button that deterministically snaps below the cookie-consent banner; desktop visitors see outcome-shaped CTA copy per placement (all tracked as distinct PostHog events via `placement`).
- Clicking a service card pre-selects the corresponding form field — no form-field back-tracking.
- `/pnld` FAQ answers funnel into blog content and contact CTAs via a structured `relatedLinks` field.
- Scroll + intent events give a real funnel view: `pageview → section_viewed → faq_opened → form_field_focused → form_submit_clicked → form_submitted`.
- `/pnld` emits Service JSON-LD for commercial-intent rich results.
- Leads without a company are scored, not blocked: the contact email surfaces a `⚠️ SEM EMPRESA` banner and PostHog gains a `has_company` property.

## Dependencies

- Marketing copywriter sign-off: not blocking — hero copy decisions were locked in the 2026-04-19 planning review (see `## Locked decisions`).
- Design sign-off on mobile sticky button visual + H1 at 64px: not blocking — same review locked visuals.
- No external content dependencies (all copy authored during planning).

---

## Locked decisions (2026-04-19)

Recorded here so the rationale survives the implementation diffs.

| #   | Decision                                                                      | Rationale                                                                                                                                                                             |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | `/` stays broad (portfolio-wide), `/pnld` stays PNLD-specialist               | SEO: two PNLD pages cannibalize each other. Sprint 3 per-edital pages slot under `/pnld/...` cleanly with `/` broad.                                                                  |
| D2  | `/pnld` hero copy = outcome-shaped, no "primeira submissão" claim             | "Aprovado na primeira submissão" asserts control over FNDE evaluation we don't fully hold; legal/PR liability if ever reprovado.                                                      |
| D3  | `/pnld` H1 caps at 64px desktop                                               | Matches `/`'s 60px H1 — visually signals same brand, one level deeper. Improves mobile LCP.                                                                                           |
| D4  | "Desde 2020" dropped from copy                                                | Mok Labs as an entity isn't strictly 2020-founded; founder experience is longer. Revisit with years-of-experience framing in Sprint 3 alongside testimonials.                         |
| D5  | CTA copy = outcome verbs ("Pedir orçamento", "Falar com especialista")        | Relationship verbs ("Vamos conversar") work but are ambiguous. Outcome verbs answer "what happens if I click this?"                                                                   |
| D6  | Service taxonomy = canonical slug pattern (option A)                          | Preserves UPPERCASE marketing display; decouples display from form enum; lets marketing rename without breaking form.                                                                 |
| D7  | `/` splits `ACESSIBILIDADE` + `AUDIODESCRIÇÃO` into two service-section items | Form now distinguishes them; combined display label would lossy-map. Grows `/` list from 6 → 9.                                                                                       |
| D8  | Company field stays optional; score instead of block                          | `/pnld` scale is too low to benefit from hard filtering; inbox triage is cheaper; anonymous pre-evaluators are signal, not noise.                                                     |
| D9  | 3 scroll/intent events (drop `scroll_depth`)                                  | Redundant with `section_viewed` at different granularity. Keeps PostHog Explorer clean.                                                                                               |
| D10 | FAQ linking = structured `relatedLinks` field, not JSX in content files       | Content files stay `.ts` (TinaCMS-compatible for future). No markdown parser to maintain. Schema input (`answer`) stays pure string.                                                  |
| D11 | Mobile sticky = z-index + `bottom` offset + custom event from cookie banner   | Avoids cross-component pub-sub state. Banner dismiss emits `cookieConsentAccepted` → sticky snaps down deterministically.                                                             |
| D12 | Service JSON-LD omits `offers`                                                | Pricing is quote-based; stub offers signal nothing useful to Google and invite downstream change. Public-price decisions belong on a Sprint 3 pricing surface, not buried in JSON-LD. |
| D13 | `/` FAQ `relatedLinks` deferred to Sprint 4                                   | 4 of 5 homepage FAQ answers have no destination stronger than `#contato` — low internal-link value. Revisit when blog/case-studies corpus grows.                                      |

---

## Tasks

### T2.0 — Canonical service taxonomy (foundation)

**Why**: The real-world service taxonomy today is **three divergent lists** (form `SERVICE_OPTIONS`, `/` `ServicesSection` items, `/pnld` `ServicesSectionPnld` items). None aligns. Click tracking aside, this is a silent data-quality bug: visitors who click a homepage service (e.g. "CONTEÚDO MULTIMÍDIA") land in a form dropdown that doesn't contain that value, fall through to "Outros" or leave it blank. Fixing this unblocks T2.5.

**New module**: `apps/web/lib/services.ts`

```ts
export const SERVICE_SLUGS = [
  // Conteúdo Digital
  "Livro Digital",
  "PNLD Digital",
  "Objetos Digitais",
  "Jogos Educacionais",
  "Simuladores",
  "Conteúdo Multimídia",
  // Acessibilidade & Inclusão
  "Acessibilidade",
  "Audiodescrição",
  // Tecnologia
  "IA Aplicada à Educação",
  "Automação",
  "Interatividade",
  "Conversão EPUB3",
  // Criação
  "Ilustração",
  // Serviços
  "Consultoria",
  "Outros",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const SERVICE_GROUPS: ReadonlyArray<{
  label: string;
  slugs: ReadonlyArray<ServiceSlug>;
}> = [
  {
    label: "Conteúdo Digital",
    slugs: [
      "Livro Digital",
      "PNLD Digital",
      "Objetos Digitais",
      "Jogos Educacionais",
      "Simuladores",
      "Conteúdo Multimídia",
    ],
  },
  {
    label: "Acessibilidade & Inclusão",
    slugs: ["Acessibilidade", "Audiodescrição"],
  },
  {
    label: "Tecnologia",
    slugs: [
      "IA Aplicada à Educação",
      "Automação",
      "Interatividade",
      "Conversão EPUB3",
    ],
  },
  { label: "Criação", slugs: ["Ilustração"] },
  { label: "Serviços", slugs: ["Consultoria", "Outros"] },
];

export const isServiceSlug = (v: unknown): v is ServiceSlug =>
  typeof v === "string" && (SERVICE_SLUGS as readonly string[]).includes(v);
```

**Files to update (consumers of taxonomy)**:

- `apps/web/components/forms/ContactForm.tsx` — replace inline `SERVICE_OPTIONS` with import from `lib/services`; render `<optgroup>`s using `SERVICE_GROUPS`.
- `apps/web/app/api/contact/route.ts` — replace inline `SERVICE_OPTIONS` + `isServiceOption` guard with `SERVICE_SLUGS` + `isServiceSlug` from `lib/services`.

**Display-layer wiring** (see T2.5).

**Acceptance**:

- [ ] `SERVICE_SLUGS` is the single source of truth; no other file defines a service list.
- [ ] Form dropdown renders with 5 `<optgroup>`s + 15 options.
- [ ] Server POST with any of the 15 slugs succeeds; POST with any other value returns 400.

**Risk**: Backward compatibility — historical submissions may have values like "Outros" or the 9 previous strings. All 9 legacy values are present in the new 15-value set, so forward-compat is preserved.

**Effort**: S (1h)

---

### T2.1 — `/` hero: add subtitle support + broad portfolio copy

**Why**: `mainContent.ts:3` title `"Soluções digitais para a educação, sem complicação"` is brand-voice without outcome framing. `HeroMainProps` in `components/sections/shared/HeroSectionMain.tsx` doesn't support subtitle at all (unlike `HeroPnldProps` which already renders subtitle at line 39). Two concrete gaps.

Note: the plan originally scoped this as "add subtitle to both heroes" — `/pnld` already ships with subtitle (line 4–5 of `pnldContent.ts`). Scope narrowed to `/` only.

**Files**:

- `apps/web/components/sections/shared/HeroSectionMain.tsx:17-24` — add `subtitle?: string` to `HeroMainProps.content`; render between `<h1>` and buttons.
- `apps/web/content/mainContent.ts:2-22` — add subtitle field; update title.

**Locked copy (D1)**:

- Title: _"Tecnologia educacional feita sob medida para editoras e edtechs brasileiras."_
- Subtitle: _"Do livro digital ao PNLD, dos jogos educacionais à IA aplicada — entregamos com acessibilidade e conformidade como padrão, não como extra."_

**Render shape** (between H1 and buttons):

```tsx
{
  content.subtitle && (
    <p className="text-lg sm:text-xl md:text-2xl text-mok-blue/80 leading-[1.4] max-w-2xl">
      {content.subtitle}
    </p>
  );
}
```

**Acceptance**:

- [ ] `/` renders title + subtitle + CTAs with no layout regression
- [ ] Mobile at 320px: subtitle wraps cleanly, no horizontal scroll
- [ ] Subtitle is a single `<p>` — zero JS cost, no Lighthouse perf regression

**Verification**: Screenshot at 320, 768, 1280, 1920px. Lighthouse perf ±2% of baseline.

**Effort**: S (1h)

---

### T2.2 — `/pnld` hero: outcome copy + 64px H1 cap

**Why**: Two things at once. H1 at `lg:text-[98px]` (`HeroSectionPnld.tsx:35`) hurts mobile LCP + forces awkward wraps. Title copy "PNLD digital sem complicação" echoes the `/` brand anchor but lacks PNLD-specific search intent ("PNLD 2028 anos finais", "EPUB3 acessível", "reprovação PNLD FNDE").

**Files**:

- `apps/web/content/pnldContent.ts:3-5` — rewrite title + subtitle.
- `apps/web/components/sections/shared/HeroSectionPnld.tsx:35` — cap H1 size.

**Locked copy (D2, D4)**:

- Title: _"PNLD Digital, do InDesign ao edital, sem retrabalho."_
- Subtitle: _"Adaptação EPUB3 em 2–4 semanas com acessibilidade WCAG 2.1 AA, interatividade e conformidade total com o edital FNDE. Especialistas em editoras educacionais brasileiras."_

**H1 sizing (D3)** — matches `/`'s scale:

```tsx
<h1 className="text-[32px] max-w-5xl sm:text-[44px] md:text-[56px] lg:text-[64px] font-bold text-white leading-tight mb-4 sm:mb-6">
```

**Acceptance**:

- [ ] H1 cap at 64px desktop, 56px at `md`, 44px at `sm`, 32px mobile
- [ ] No horizontal scroll on mobile at 320px
- [ ] LCP on `/pnld` mobile improves by ≥10% vs. pre-sprint baseline
- [ ] Subtitle reads well at new title scale

**Verification**: Lighthouse perf before/after; Chrome DevTools mobile simulation at 320px.

**Effort**: S (1h)

---

### T2.3 — Outcome-shaped CTA copy per placement

**Why**: "Vamos conversar!" appears on 4 CTAs with identical text. Outcome-shaped copy ("Pedir orçamento") answers the click-intent question buyers actually hold. PostHog `placement` property is already per-placement in Sprint 1's `WhatsAppLink` — each variant becomes a distinct funnel event at zero tracking cost.

**Locked CTA matrix (D5)**:

| Page    | Placement               | New text                   | PostHog `placement`          |
| ------- | ----------------------- | -------------------------- | ---------------------------- |
| `/`     | Hero primary (WhatsApp) | **Pedir orçamento**        | `hero-home`                  |
| `/`     | Hero secondary (anchor) | **Ver serviços**           | — (Link to `#servicos`)      |
| `/`     | CTA banner (WhatsApp)   | **Falar com especialista** | `banner-home`                |
| `/pnld` | Hero primary (WhatsApp) | **Pedir orçamento PNLD**   | `hero-pnld`                  |
| `/pnld` | Hero secondary (anchor) | **Como funciona**          | — (Link to `#como-funciona`) |
| `/pnld` | CTA banner (WhatsApp)   | **Iniciar projeto PNLD**   | `banner-pnld`                |

Footer phone link stays as the phone number — no text change.

**Files**:

- `apps/web/content/mainContent.ts` — hero buttons[0].text, buttons[1].text, ctaBanner.buttonText
- `apps/web/content/pnldContent.ts` — same fields + update buttons[1].url from `#servicos` → `#como-funciona`
- `apps/web/components/sections/shared/HowWorksSectionPnld.tsx:15` — add `id="como-funciona"` to `<section>` root

**Acceptance**:

- [ ] Each placement renders locked label; no text regression on narrow widths (all labels ≤25 chars)
- [ ] PostHog `whatsapp_click` events differentiate by `placement` across the 4 WhatsApp CTAs
- [ ] `/pnld` hero secondary CTA click scrolls to `#como-funciona`
- [ ] `/pnld` hero CTA message prefills reference "PNLD" consistently

**Verification**: PostHog Insights → funnel by `placement` after 1 week of traffic.

**Effort**: S (1h)

---

### T2.4 — Mobile sticky WhatsApp button

**Why**: Brazilian mobile audience expects persistent WhatsApp buttons on service/sales pages. Expected lift: 10–20% mobile conversion.

**New component**: `apps/web/components/common/StickyWhatsAppButton.tsx`

**Locked stacking approach (D11)**: z-index + bottom offset + custom `cookieConsentAccepted` event dispatched by `CookieConsent.handleAccept`.

**Implementation**:

```tsx
// components/common/StickyWhatsAppButton.tsx
"use client";
import { useEffect, useState } from "react";
import WhatsAppLink from "./WhatsAppLink";

const STORAGE_KEY = "cookieConsent";
const EVENT_NAME = "cookieConsentAccepted";

const StickyWhatsAppButton = () => {
  const [consentAccepted, setConsentAccepted] = useState(true);

  useEffect(() => {
    setConsentAccepted(localStorage.getItem(STORAGE_KEY) === "true");
    const handler = () => setConsentAccepted(true);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  return (
    <div
      className={`fixed right-4 z-50 sm:hidden transition-[bottom] duration-300 ${
        consentAccepted ? "bottom-4" : "bottom-24"
      }`}
    >
      <WhatsAppLink
        message="Olá! Vim do site da Mok Labs."
        placement="mobile-sticky"
        className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#1ebc58] transition-colors font-bold"
      >
        Fale conosco
      </WhatsAppLink>
    </div>
  );
};

export default StickyWhatsAppButton;
```

**Files**:

- `apps/web/components/common/StickyWhatsAppButton.tsx` (new)
- `apps/web/components/common/index.ts` — barrel
- `apps/web/components/common/CookieConsent.tsx:17-33` — dispatch `window.dispatchEvent(new Event("cookieConsentAccepted"))` inside `handleAccept` after `localStorage.setItem`
- `apps/web/components/layout/ConditionalLayout.tsx` — mount `<StickyWhatsAppButton />` in the non-standalone branch

**Acceptance**:

- [ ] Button visible on mobile viewports across `/`, `/pnld`, `/blog`, `/blog/[slug]`, `/politica-de-privacidade`
- [ ] Absent on `/pnld-chat/*`
- [ ] First-visit (consent pending): button sits at `bottom-24` (above banner)
- [ ] After consent: button snaps down to `bottom-4` within 300ms
- [ ] `whatsapp_click` fires with `placement: "mobile-sticky"`

**Verification**: Chrome DevTools mobile sim + real iPhone + Android smoke test. Clear localStorage between tests to re-render consent banner.

**Effort**: M (2h)

---

### T2.5 — Service cards pre-fill contact form via query param

**Why**: Homepage/PNLD service sections today are plain `<div>`s with no link. Visitor sees "LIVROS DIGITAIS", scrolls to the form, re-selects the same thing. One friction point, one lost signal.

**Depends on**: T2.0 (canonical taxonomy must exist first).

**Data model change**: `ServicesSection.items: string[]` → `ServicesSection.items: Array<{ label: string; canonical: ServiceSlug }>`.

**Locked display lists (D6, D7)**:

`/` services (9 items):

| Display                        | → canonical            |
| ------------------------------ | ---------------------- |
| LIVROS DIGITAIS                | Livro Digital          |
| PNLD DIGITAL _(new)_           | PNLD Digital           |
| JOGOS EDUCACIONAIS             | Jogos Educacionais     |
| CONTEÚDO MULTIMÍDIA            | Conteúdo Multimídia    |
| IA APLICADA À EDUCAÇÃO _(new)_ | IA Aplicada à Educação |
| ACESSIBILIDADE _(split)_       | Acessibilidade         |
| AUDIODESCRIÇÃO _(split)_       | Audiodescrição         |
| CONSULTORIA DIGITAL            | Consultoria            |
| AUTOMAÇÃO                      | Automação              |

`/pnld` services (7 items):

| Display                                       | → canonical      |
| --------------------------------------------- | ---------------- |
| LIVROS DIGITAIS                               | Livro Digital    |
| PNLD DIGITAL                                  | PNLD Digital     |
| OBJETOS DIGITAIS _(new — part of PNLD scope)_ | Objetos Digitais |
| ACESSIBILIDADE                                | Acessibilidade   |
| INTERATIVIDADE                                | Interatividade   |
| AUDIODESCRIÇÃO                                | Audiodescrição   |
| CONSULTORIA E SUPORTE                         | Consultoria      |

**Files**:

- `apps/web/content/mainContent.ts:24-40` — rewrite services items as `{ label, canonical }[]`
- `apps/web/content/pnldContent.ts:27-43` — same
- `apps/web/components/sections/shared/ServicesSection.tsx` — accept new item shape, wrap each item in `<Link href={"/#contato?service=" + encodeURIComponent(item.canonical)}>`, style stays identical
- `apps/web/components/sections/shared/ServicesSectionPnld.tsx` — same (href uses `"/pnld#contato?service=..."` or just `"#contato?service=..."` depending on component-location)
- `apps/web/components/forms/ContactForm.tsx` — read `?service=` from query + hash on mount, initialize `formData.service` when value is a valid `ServiceSlug`

**Form pre-fill implementation**:

```tsx
useEffect(() => {
  if (typeof window === "undefined") return;
  const searchParams = new URLSearchParams(window.location.search);
  const hashQuery = window.location.hash.includes("?")
    ? window.location.hash.split("?").slice(1).join("?")
    : "";
  const hashParams = new URLSearchParams(hashQuery);
  const raw = searchParams.get("service") ?? hashParams.get("service");
  if (raw && isServiceSlug(raw)) {
    setFormData((prev) => ({ ...prev, service: raw }));
  }
}, []);
```

**Acceptance**:

- [ ] Clicking any service card scrolls to `#contato` and pre-selects the corresponding dropdown option
- [ ] Invalid `?service=…` values are ignored (no state mutation)
- [ ] Visiting `#contato` with no query leaves dropdown empty (existing behavior)
- [ ] Service cards keep current UPPERCASE visual; no layout regression

**Verification**: Click-through each of the 9 + 7 service cards → confirm pre-select in dropdown.

**Effort**: M (2–3h)

---

### T2.6 — `/pnld` FAQ `relatedLinks` (structured, not inline markup)

**Why**: FAQ answers on `/pnld` are substantive but terminal. Every answer is an internal-link opportunity (SEO + conversion). `/` FAQ `relatedLinks` deferred per D13.

**Depends on**: T2.0 (for `?service=...` targets in links).

**Data model change (D10)** — `FAQItem` gets an optional structured links array:

```ts
interface FAQItem {
  question: string;
  answer: string; // unchanged — FAQPage JSON-LD feeds this directly
  relatedLinks?: Array<{
    label: string;
    href: string;
    variant?: "link" | "cta"; // default "link"; "cta" renders button-styled
  }>;
}
```

**Files**:

- `apps/web/content/pnldContent.ts:109-140` — add `relatedLinks` per answer
- `apps/web/components/ui/Accordion.tsx` — accept + render `relatedLinks` block below answer text; still accept plain `{question, answer}` items (backward compatible for `/` FAQ which ships without links in Sprint 2)
- `apps/web/components/sections/FAQ.tsx` — widen `FAQContent.items` type
- `apps/web/lib/seo/schemas.ts` — no change; `buildFAQSchema` still consumes only `{question, answer}`

**Locked per-answer links for `/pnld`**:

| Question                                                  | `relatedLinks`                                                                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| O que é o PNLD digital?                                   | `{label: "Leia o guia do PNLD 2028", href: "/blog/pnld-2028-2031-anos-finais-primeiras-informacoes", variant: "link"}` |
| Quanto tempo leva para adaptar?                           | `{label: "Pedir orçamento PNLD", href: "#contato?service=PNLD%20Digital", variant: "cta"}`                             |
| E se meus arquivos não estiverem prontos?                 | `{label: "Falar com consultor", href: "#contato?service=Consultoria", variant: "cta"}`                                 |
| O que acontece se o material não estiver em conformidade? | `{label: "Guia de EPUB acessível", href: "/blog/epub-acessivel-guia-completo", variant: "link"}`                       |
| Por que confiar na Mok Labs?                              | `{label: "Iniciar projeto PNLD", href: "#contato?service=PNLD%20Digital", variant: "cta"}`                             |

Blog post slugs must be validated as existing during implementation. If `pnld-2028-2031-anos-finais-primeiras-informacoes` or `epub-acessivel-guia-completo` don't exist (or have different slugs), we'll substitute with closest available or drop the link. Noted as implementation check.

**Accordion render shape**:

```tsx
<div className="pl-6 pb-6 text-mok-blue text-[16px] leading-[1.6]">
  {answer}
  {relatedLinks && relatedLinks.length > 0 && (
    <div className="mt-4 flex flex-wrap gap-3">
      {relatedLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            link.variant === "cta"
              ? "inline-flex items-center rounded-full bg-mok-blue text-white px-4 py-1.5 text-sm font-semibold hover:bg-mok-blue/90"
              : "underline text-mok-blue hover:text-mok-blue/80 text-sm"
          }
        >
          {link.label}
        </Link>
      ))}
    </div>
  )}
</div>
```

**Acceptance**:

- [ ] Each of 5 `/pnld` FAQ items renders the locked `relatedLinks`
- [ ] `link` variant: text-underline style; `cta` variant: button-style
- [ ] Clicking a `cta` link scrolls to `#contato` + pre-fills service dropdown (via T2.5)
- [ ] `/` FAQ renders with no `relatedLinks` block (field absent, backward-compat)
- [ ] FAQPage JSON-LD `acceptedAnswer.text` unchanged — still equals `answer` string

**Verification**: Validator.schema.org/ on `/pnld` after deploy — FAQPage still validates.

**Effort**: M (2h)

---

### T2.7 — Scroll/intent PostHog events (3 events, not 4)

**Why**: Today the only funnel signal between pageview and form submit is sparse. Without intent events we can't answer "where do visitors drop off on `/pnld`?" Section-level tracking + FAQ engagement + form-field focus are the three highest-signal diagnostics.

**Locked scope (D9)**: drop `scroll_depth` as redundant with `section_viewed`.

**New modules**:

- `apps/web/lib/posthog/sections.ts` — string constants for section identifiers so `/` and `/pnld` use consistent names.
- `apps/web/components/common/SectionTracker.tsx` — IntersectionObserver wrapper.

**Section constants**:

```ts
// lib/posthog/sections.ts
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
```

**SectionTracker**:

```tsx
"use client";
import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import type { SectionName } from "@/lib/posthog/sections";

interface Props {
  section: SectionName;
  children: React.ReactNode;
}

const SectionTracker = ({ section, children }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    let fired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!fired && entry.intersectionRatio >= 0.5) {
            fired = true;
            if (typeof window !== "undefined" && posthog.__loaded) {
              posthog.capture("section_viewed", {
                section,
                page: window.location.pathname,
              });
            }
          }
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [section]);
  return <div ref={ref}>{children}</div>;
};

export default SectionTracker;
```

**Events shipped (3)**:

| Event                        | Trigger                                            | Properties                                                   |
| ---------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| `section_viewed`             | Section ≥50% visible, once per section per session | `section: SectionName`, `page: string`                       |
| `faq_opened`                 | User opens an accordion item                       | `question: string`, `question_index: number`, `page: string` |
| `contact_form_field_focused` | First focus on any form input, once per session    | `first_field: string`, `page: string`                        |

**Files**:

- `apps/web/lib/posthog/sections.ts` (new)
- `apps/web/components/common/SectionTracker.tsx` (new)
- `apps/web/app/page.tsx`, `apps/web/app/pnld/page.tsx` — wrap each section with `<SectionTracker section={SECTION.XXX}>`
- `apps/web/components/ui/Accordion.tsx:94` — fire `faq_opened` inside `toggleItem` when opening (not closing)
- `apps/web/components/forms/ContactForm.tsx` — add `onFocus` handler on fields; use a module-scoped `hasFocusedOnce` ref/state to gate once-per-mount

**Acceptance**:

- [ ] Scrolling `/pnld` fires `section_viewed` for each of ~8 sections, once each
- [ ] Opening any FAQ item fires `faq_opened` with the question text
- [ ] First focus on any ContactForm field fires `contact_form_field_focused` once
- [ ] Closing an accordion item does NOT re-fire `faq_opened`

**Verification**: PostHog Live Events view during a 2-minute browse session; filter by each event name.

**Risk**: IntersectionObserver unsupported in ancient browsers — gracefully no-op (not a concern for target audience).

**Effort**: M (3h)

---

### T2.8 — Service JSON-LD on `/pnld`

**Why**: Service is the canonical schema.org type for a service offering. Rich-card eligibility on commercial-intent queries ("PNLD digital", "adaptação EPUB3").

**Locked schema shape (D12)** — no `offers` block, tightened `serviceType`, `audience` added, minimal `provider`:

```ts
// lib/seo/schemas.ts
export const pnldServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Adaptação de Livros Didáticos para o PNLD Digital",
  serviceType: "Adaptação de livros didáticos para PNLD",
  description:
    "Serviço completo de adaptação de livros didáticos e materiais educacionais para conformidade com os editais PNLD/FNDE — incluindo conversão EPUB3, acessibilidade WCAG 2.1 AA, audiodescrição, interatividade e consultoria técnica.",
  provider: {
    "@type": "Organization",
    name: "Mok Labs",
    url: BASE_URL,
  },
  areaServed: { "@type": "Country", name: "Brasil" },
  audience: {
    "@type": "Audience",
    audienceType: "Editoras Educacionais",
  },
} as const;
```

**Files**:

- `apps/web/lib/seo/schemas.ts` — export `pnldServiceSchema`
- `apps/web/lib/seo/index.ts` — barrel
- `apps/web/app/pnld/page.tsx` — render `<script type="application/ld+json">` alongside the FAQ schema already shipped

**Acceptance**:

- [ ] `/pnld` view-source contains the Service JSON-LD
- [ ] https://validator.schema.org/ validates Service
- [ ] Google Rich Results Test shows Service-type entity recognized

**Effort**: S (30 min)

---

### T2.9 — Lead scoring for submissions without company

**Why**: Real PNLD buyers are always named editoras; a nameless individual is usually a student/curious person. Filter without blocking (D8): score in email + PostHog.

**Files**:

- `apps/web/app/api/contact/route.ts:290-320` — add `⚠️ SEM EMPRESA` banner to email body when `trimmedCompany` is empty
- `apps/web/app/api/contact/route.ts:360-378` — add `has_company: boolean` to PostHog `lead_submitted_server` properties
- `apps/web/components/forms/ContactForm.tsx:175-180` — add `has_company: !!payload.company` to client-side `lead_submitted` properties

**Email banner implementation** (inserted after the "Novo contato via site" header, before the data block):

```ts
const noCompanyBanner = trimmedCompany
  ? ""
  : `<div style="background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 12px 16px; border-radius: 8px; margin: 16px 0; font-weight: 600;">⚠️ Lead sem empresa/editora informada — triagem recomendada antes de responder.</div>`;

// inject after the h2:
// ...<h2>...</h2>
// ${noCompanyBanner}
// <div style="background: #f8fafc; ...">...</div>
```

**Acceptance**:

- [ ] Submitting without company: email includes the yellow banner at top
- [ ] Submitting with company: email unchanged from Sprint 1 shape
- [ ] PostHog event `lead_submitted` + `lead_submitted_server` both include `has_company: boolean`
- [ ] No client-side validation change — company field stays optional on all pages

**Verification**: Manual submission on `/pnld` preview without + with company; inspect Resend inbox + PostHog Live Events.

**Effort**: S (30 min)

---

## Sprint 2 — Verification checklist

Before closing the sprint:

- [ ] `/` hero shows new subtitle; mobile 320px renders cleanly
- [ ] `/pnld` H1 capped at 64px desktop; LCP mobile improved vs. baseline
- [ ] All 6 WhatsApp placements show outcome-shaped labels; PostHog `whatsapp_click` differentiates via `placement`
- [ ] Mobile sticky button: visible on `/`, `/pnld`, blog index, blog slug; absent on `/pnld-chat/*`; sits at `bottom-24` during consent, snaps to `bottom-4` after
- [ ] Clicking any service card (9 on `/`, 7 on `/pnld`) pre-fills the form dropdown with the correct canonical value
- [ ] Form dropdown renders 5 `<optgroup>`s, 15 slugs total; server POST allowlist matches
- [ ] `/pnld` FAQ: each of 5 items renders `relatedLinks`; `link` vs `cta` variants styled distinctly; FAQPage JSON-LD `acceptedAnswer.text` unchanged
- [ ] PostHog live events show `section_viewed` (once per section), `faq_opened` (on accordion toggle-open), `contact_form_field_focused` (once per session)
- [ ] Service JSON-LD on `/pnld` validates at validator.schema.org
- [ ] Submissions without company show `⚠️ SEM EMPRESA` banner in email; `has_company` property in PostHog events
- [ ] Lighthouse SEO = 100 on `/` and `/pnld`; Performance mobile ≥85; A11y ≥95
- [ ] `HowWorksSectionPnld` root has `id="como-funciona"`; secondary CTA on `/pnld` hero scrolls to it

## Metrics to watch

Measure 2 weeks post-Sprint 2:

- **Form completion rate** (`lead_form_viewed` → `lead_submitted`): target +10 pp
- **WhatsApp click-through rate** (`pageview` → `whatsapp_click`): target +15%
- **Mobile sticky CTR**: `whatsapp_click` where `placement = "mobile-sticky"` as share of total WhatsApp clicks
- **Per-placement CTA performance**: break down `whatsapp_click` by `placement`; identify underperformers for next iteration
- **Service-card → form pre-fill success rate**: sessions where a service card was clicked and the form's `service` field was populated on submission
- **Lead quality**: share of `lead_submitted` with `has_company: true` (baseline + trend)
- **Funnel diagnostic**: `section_viewed: services` → `lead_submitted` ratio

## Risks & rollback

- **Copy changes** (T2.1, T2.2, T2.3) — trivially reversible via content files.
- **Taxonomy change** (T2.0 + T2.5) — the form enum extension is additive (legacy 9 values remain). Rollback: revert the commit; legacy form submissions keep working.
- **Sticky button** (T2.4) — rollback = unmount in `ConditionalLayout`. Cookie-consent custom event is backward-compat (no listeners = no effect).
- **FAQ schema integrity** (T2.6) — `answer` stays a plain string; `relatedLinks` is rendered-only. Zero schema risk.
- **Scroll events** (T2.7) — low-cardinality, gated once-per-session. PostHog project remains quiet.
- **Company scoring** (T2.9) — visual-only in email + one new PostHog property. No user-facing behavior change.

## Out of scope

- Lead magnet / calendar booking (Sprint 3)
- Social proof content — logos, testimonials, case studies (Sprint 3)
- Retargeting pixels (Sprint 4)
- Per-edital landing pages (Sprint 3)
- `/` FAQ `relatedLinks` (Sprint 4 — D13)
- `scroll_depth` event (D9)
- Dynamic per-blog-post OG images (Sprint 4)
- Pricing page or public pricing signaling (Sprint 3)
