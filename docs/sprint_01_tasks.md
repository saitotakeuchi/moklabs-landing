# Sprint 1 — Foundations & Quick Wins

**Theme**: Fix production bugs, ship the SEO schema foundation, make the WhatsApp branch of the funnel measurable.
**Wall time**: ~1 week of focused engineering effort (est. 2–4 developer-days)
**Parent plan**: [LANDING_CRO_SEO_PLAN.md](./LANDING_CRO_SEO_PLAN.md)

## Why this sprint first

Two reasons. First, there are genuine bugs (missing hero image, broken OG previews, form without labels) that any new marketing effort would drag along. Second, instrumentation must precede optimization — if we change hero copy in Sprint 2 without a `whatsapp_click` event, we can't tell whether the change moved the funnel or just redirected it.

Sprint 1 is low-risk, high-density, and unlocks measurability for everything that follows.

## Outcomes

- Every social/link preview renders a proper image (PNG/JPG, not SVG).
- `/` and `/pnld` emit Organization + WebSite + FAQPage JSON-LD; blog posts add BreadcrumbList.
- Every WhatsApp click is captured in PostHog with CTA placement + UTM passthrough.
- Contact form is accessible via screen readers; production deployment doesn't ship with a missing hero asset.

## Dependencies

- Design: PNG OG image assets (1200×630) for `/` and `/pnld` at minimum. Ideally one per blog post via `opengraph-image.tsx` route.
- No content dependencies (reuse existing FAQ copy, existing WhatsApp number).

---

## Tasks

### T1.1 — Restore `main-lp-hero.svg` in local working tree

**Corrected framing (was previously flagged P0/prod bug — it is not):**

`apps/web/public/main-lp-hero.svg` is present in every tracked ref (HEAD, main, origin/main, staging, origin/staging — blob `37eb6a3b9c…`). Prod serves from origin/main, which contains the file. The `D` in `git status` is a **local-only** working-tree deletion, part of a larger uncommitted sweep (pycache artifacts, Geist font files, figma-assets, one webp). Local dev renders a broken image because the file is missing from disk, but prod is unaffected.

**Files**:

- `apps/web/public/main-lp-hero.svg` — restore from HEAD

**Implementation**:

```bash
git checkout HEAD -- apps/web/public/main-lp-hero.svg
```

No code change. No commit needed (file already matches HEAD once restored).

**Acceptance**:

- [ ] `test -f apps/web/public/main-lp-hero.svg` → exists
- [ ] `git status` no longer shows `D` for that path
- [ ] `pnpm dev` loads `/` without broken image

**Risk**: None.

**Effort**: <5 min.

---

### T1.2 — Ship PNG Open Graph images

**Why**: `app/layout.tsx:83`, `config/seoConfig.ts:9,18,26`, `config/site.ts:131`, and `app/blog/[slug]/page.tsx:44,193` all point to `/og-image.svg`. **WhatsApp, Facebook, LinkedIn, Twitter, iMessage do not render SVG** for link previews. Every share of moklabs.com.br right now produces a blank or fallback card. Given WhatsApp is the primary CTA, this is a large organic-share leak. Blog slug pages share the same leak since they also emit the SVG reference.

**Files**:

- `apps/web/public/og-home.png` (new) — 1200×630 PNG for `/`
- `apps/web/public/og-pnld.png` (new) — variant for `/pnld`
- `apps/web/public/og-blog-default.png` (new) — fallback for all blog posts (per-post dynamic deferred to Sprint 4)
- `apps/web/app/layout.tsx` — swap `og-image.svg` → `og-home.png`
- `apps/web/config/seoConfig.ts` — per-page image fields
- `apps/web/config/site.ts` — ogImage field
- `apps/web/app/blog/[slug]/page.tsx` — swap in `og-blog-default.png`
- Delete `apps/web/public/og-image.svg` after all references removed

**Implementation (static PNG variant — ship this first)**:

1. Design exports two PNGs at 1200×630.
2. Drop into `public/`.
3. Update `layout.tsx` and `seoConfig.ts` references. Ensure each `seoConfig.*.image` is a unique per-page asset or that `generateMetadata` per page overrides correctly.

**Implementation (dynamic variant — follow-up)**:
Use Next.js 14's `opengraph-image.tsx` file convention with `next/og`'s `ImageResponse`. Enables per-blog-post OG images with post title baked in.

```tsx
// apps/web/app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);
  return new ImageResponse(
    (
      <div
        style={
          {
            /* brand layout */
          }
        }
      >
        <h1>{post?.title}</h1>
        <p>Mok Labs</p>
      </div>
    ),
    size,
  );
}
```

**Acceptance**:

- [ ] `/og-image.svg` reference removed from `app/layout.tsx` and `seoConfig.ts`
- [ ] `/og-image.png` (or dynamic variant) loads at 1200×630
- [ ] `/pnld` and `/` show distinct OG images
- [ ] Existing blog posts have at least a static fallback OG image; dynamic per-post shipped separately

**Verification**:

1. Deploy to preview.
2. Paste preview URL into https://developers.facebook.com/tools/debug/ → image preview rendered.
3. LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/ → same.
4. Paste URL into a WhatsApp message thread → preview card shows image.
5. Twitter/X Card Validator is deprecated but Slack unfurl works as a quick check.

**Risk**: If dynamic `opengraph-image.tsx` runs on Vercel edge, `getPostBySlug` (file-system read) won't work. **Mitigation**: run dynamic OG on Node runtime (`export const runtime = "nodejs"`), or ship static PNGs only in Sprint 1 and defer dynamic to Sprint 4.

**Effort**: M (static: 2–3h; dynamic: +1 day)

---

### T1.3 — Add `<label>` elements to contact form

**Why**: `components/forms/ContactForm.tsx:273-347` uses `placeholder` as the only visible field identifier. Placeholders are **not accessible labels** — they disappear on focus, screen readers can't reliably announce them, and they hurt conversion for users who mid-type forget which field is which.

**Files**:

- `apps/web/components/forms/ContactForm.tsx`

**Implementation**:
All inputs already have `id` attributes. Add `<label htmlFor>` with Tailwind's `sr-only` class so the visual design is unchanged but screen readers announce properly. Alternatively, show labels visually (recommended — studies show visible labels beat placeholders on completion rate).

```tsx
<div className="flex flex-col">
  <label htmlFor="name" className="sr-only">
    Nome completo
  </label>
  <input
    id="name"
    name="name"
    type="text"
    placeholder="Nome"
    value={formData.name}
    onChange={handleChange}
    className={inputClass(errors.name)}
  />
  {fieldError(errors.name)}
</div>
```

Same pattern for email, company, service (already has aria-label — replace with a real label), message.

**Acceptance**:

- [ ] All 5 fields have `<label htmlFor>` elements
- [ ] VoiceOver / NVDA tab through form announces each field label
- [ ] Visual design unchanged (labels are `sr-only`) — OR — visible labels shipped per design review

**Verification**:

1. Keyboard navigate the form in Safari → Hotkey VoiceOver (Cmd+F5) → tab through form → hear "Nome, edit text" etc.
2. Lighthouse Accessibility score: was ≤90 before, expect ≥95 after.

**Risk**: None. Purely additive.

**Effort**: S (30–60 min)

---

### T1.4 — Delete dead `SEOHead.tsx`

**Why**: `components/common/SEOHead.tsx` is marked deprecated at line 13-15 and not used anywhere — but still re-exported from `components/common/index.ts:10`. Risk is future developer imports it, mutates document.head at runtime, and creates duplicate meta tags.

**Files**:

- `apps/web/components/common/SEOHead.tsx` — delete
- `apps/web/components/common/index.ts:10` — remove re-export

**Implementation**:
Before deleting, extract the Organization schema (lines 79-100) and reuse in T1.6. That schema is well-written and the only valuable piece of this file.

**Acceptance**:

- [ ] File deleted
- [ ] Barrel export removed
- [ ] `pnpm type-check` and `pnpm lint` pass
- [ ] `rg SEOHead apps/web` returns no results

**Verification**: `pnpm build` completes without error.

**Risk**: None. Component is unused.

**Effort**: S (15 min)

---

### T1.5 — Extract JSON-LD schema builders to `lib/seo/schemas.ts`

**Why**: T1.6 through T1.8 all need JSON-LD helpers. Rather than inline JSON objects in three different pages, centralize so schemas are typed, composable, and unit-testable.

**Files**:

- `apps/web/lib/seo/schemas.ts` (new)
- `apps/web/lib/seo/index.ts` (new, barrel)

**Implementation**:

```ts
// lib/seo/schemas.ts
import type {
  WithContext,
  Organization,
  WebSite,
  FAQPage,
  BreadcrumbList,
  Service,
  BlogPosting,
} from "schema-dts"; // or hand-type

const BASE_URL = "https://moklabs.com.br";

export const organizationSchema: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MokLabs",
  alternateName: "Mok Labs",
  url: BASE_URL,
  logo: `${BASE_URL}/logo-moklabs.svg`,
  description: "…" /* pulled from SEOHead.tsx */,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+55-41-93618-2622",
    contactType: "customer service",
    availableLanguage: ["Portuguese", "pt-BR"],
    areaServed: "BR",
  },
  sameAs: ["https://instagram.com/moklabs"],
  address: {
    "@type": "PostalAddress",
    addressCountry: "BR",
  },
};

export const websiteSchema: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Mok Labs",
  url: BASE_URL,
  inLanguage: "pt-BR",
  // Optionally add potentialAction for site search if/when we add one
};

export const buildFAQSchema = (
  items: Array<{ question: string; answer: string }>,
): WithContext<FAQPage> => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

export const buildBreadcrumbSchema = (
  trail: Array<{ name: string; url: string }>,
): WithContext<BreadcrumbList> => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
  })),
});

// buildServiceSchema is defined here too but ships in Sprint 2 (T2.x)
```

And a reusable component:

```tsx
// lib/seo/JsonLd.tsx (or keep as helper)
export const JsonLd = ({ data }: { data: object }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);
```

**Acceptance**:

- [ ] `lib/seo/schemas.ts` exports `organizationSchema`, `websiteSchema`, `buildFAQSchema`, `buildBreadcrumbSchema`
- [ ] Barrel export in `lib/seo/index.ts`
- [ ] Unit test (if the test harness supports it; `apps/web` doesn't seem to have one set up — skip if so)

**Verification**: `pnpm type-check` passes. Import in a page file works.

**Risk**: If `schema-dts` types are heavy, pin to narrow imports or hand-type the subset used.

**Effort**: S-M (1.5–3h)

---

### T1.6 — Inject Organization + WebSite JSON-LD globally

**Why**: The site has no Organization schema currently. This is the single most important schema for brand entity recognition by Google. WebSite schema enables sitelinks in SERPs.

**Files**:

- `apps/web/app/layout.tsx` — inject into root layout so it ships on every page

**Implementation**:

```tsx
import { organizationSchema, websiteSchema } from "@/lib/seo";

// inside <body>, before children:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
/>
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
/>
```

**Acceptance**:

- [ ] View source of `/` shows both scripts
- [ ] https://validator.schema.org/ validates both on `https://moklabs.com.br/`
- [ ] Google Rich Results Test recognizes Organization

**Verification**: deploy → paste URL into https://search.google.com/test/rich-results.

**Risk**: None.

**Effort**: S (30 min)

---

### T1.7 — Emit FAQPage JSON-LD on `/` and `/pnld`

**Why**: Both pages have 5 Q/A pairs in `content/mainContent.ts:101-130` and `content/pnldContent.ts:101-131`. `FAQPage` schema can produce FAQ rich results (expandable Q&A in SERPs). This is one of the highest-leverage schemas for service pages.

**Files**:

- `apps/web/app/page.tsx` — inject on homepage
- `apps/web/app/pnld/page.tsx` — inject on PNLD page
- _(optionally)_ create a `<PageFAQ>` component that wraps `FAQ.tsx` and emits schema inline

**Implementation**:

```tsx
// in app/page.tsx
import { buildFAQSchema } from "@/lib/seo";
import { mainContent } from "@/content";

// inside component render, before/after <FAQ>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(buildFAQSchema(mainContent.faq.items)),
  }}
/>;
```

Same pattern on `/pnld` with `pnldContent.faq.items`.

**Acceptance**:

- [ ] JSON-LD script present in `/` and `/pnld` view-source
- [ ] Google Rich Results Test shows "FAQPage" eligible
- [ ] No duplicate FAQ Q/A text issues (Google requires Q/A in schema to match visible content — they do, since we source from same `content/*.ts`)

**Verification**:

1. https://validator.schema.org/#url=https%3A%2F%2Fmoklabs.com.br%2Fpnld — expect FAQPage.
2. GSC Enhancements tab: FAQ enhancement appears 1–2 weeks post-deploy.

**Risk**: Google sometimes doesn't surface FAQ rich results for all queries; still valuable for eligibility signal.

**Effort**: S (45 min)

---

### T1.8 — Emit BreadcrumbList JSON-LD on blog slug pages

**Why**: `app/blog/[slug]/page.tsx:228-255` renders a visual breadcrumb (Home / Blog / Post) but emits no BreadcrumbList schema. Adding schema enables the crumb trail to appear in SERPs instead of the raw URL.

**Files**:

- `apps/web/app/blog/[slug]/page.tsx`

**Implementation**:

```tsx
import { buildBreadcrumbSchema } from "@/lib/seo";

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Blog", url: "/blog" },
  { name: post.title, url: `/blog/${params.slug}` },
]);

// render alongside existing BlogPosting schema
```

**Acceptance**:

- [ ] `/blog/acessibilidade-digital-pnld` (and others) emit BreadcrumbList JSON-LD
- [ ] Google Rich Results Test validates

**Verification**: same tools as T1.6/T1.7.

**Risk**: None.

**Effort**: S (30 min)

---

### T1.9 — Normalize canonical URLs AND fix blog double-slash bug

**Why**: `config/seoConfig.ts`:

- Line 8: `url: "https://moklabs.com.br/"` (trailing slash)
- Line 17: `url: "https://moklabs.com.br/pnld"` (no trailing slash)
- Line 25: `url: "https://moklabs.com.br/politica-de-privacidade"` (no trailing slash)
- `metadataBase` in `app/layout.tsx:48` — no trailing slash

**Latent double-slash bug (not documented at plan authoring time):** the trailing slash on `seoConfig.home.url` causes every `${seoConfig.home.url}/blog/...` concatenation in `app/blog/[slug]/page.tsx` (lines 44, 54, 78, 193, 199, 206, 211, 214) and `app/blog/page.tsx` (22, 26) to emit `https://moklabs.com.br//blog/slug` — a double-slash canonical that has been shipping in prod. Fixing the seoConfig field fixes all downstream concatenations in one change.

Canonical mismatches between pages on the same site can confuse Google and split ranking signals.

**Files**:

- `apps/web/config/seoConfig.ts:8` — remove trailing slash
- Also audit `app/page.tsx:32` (`canonical: seoConfig.home.url`) — ensures canonical is `https://moklabs.com.br` consistently

**Implementation**:
Change `url: "https://moklabs.com.br/"` → `url: "https://moklabs.com.br"`.

Then check that `alternates.canonical: "/"` in `app/page.tsx` resolves correctly via `metadataBase` — Next.js resolves `/` against metadataBase to `https://moklabs.com.br/`. Pick one: either canonical root is with trailing slash or without. Recommend **no trailing slash except implicit root**.

**Acceptance**:

- [ ] `<link rel="canonical">` on `/` resolves to `https://moklabs.com.br` or `https://moklabs.com.br/` — consistent choice
- [ ] `/pnld` canonical is `https://moklabs.com.br/pnld`
- [ ] Blog slug canonical unchanged

**Verification**: view-source each page, grep for `rel="canonical"`, confirm.

**Risk**: If we drop the trailing slash on root and Next.js resolves differently, may need to adjust. Test in preview first.

**Effort**: S (30 min)

---

### T1.10 — Rewrite alt text in PT-BR

**Why**: Alt text drives image-search SEO and accessibility. Current state:

- `mainContent.ts:5`: `"Digital solutions illustration"` — English
- `pnldContent.ts:7`: `"Pixelated hand illustration"` — English
- Decorative star SVGs: `alt=""` (correct)
- Logo: brand name only

**Files**:

- `apps/web/content/mainContent.ts:5`
- `apps/web/content/pnldContent.ts:7`
- `apps/web/components/sections/shared/OurWaySection.tsx:45` — `alt={title}` currently (OK but generic)
- `apps/web/components/sections/shared/ServicesSection.tsx:135,170` — `alt="Sem Mok Labs"` / `"Com Mok Labs"` OK
- `apps/web/components/sections/Footer.tsx:17`, `Header.tsx:87` — logo `alt="Mok Labs"` (OK)

**Implementation**:

- Homepage hero alt: `"Ilustração de soluções digitais educacionais — Mok Labs"` (descriptive + branded)
- PNLD hero alt: `"Ilustração de mão pixelada representando adaptação digital de livros didáticos para o PNLD"`

**Acceptance**:

- [ ] All images on `/` and `/pnld` have PT-BR descriptive alt text OR empty alt (for purely decorative images)
- [ ] Lighthouse Accessibility score rises

**Verification**: Lighthouse pass + manual screen-reader sweep.

**Risk**: None.

**Effort**: S (30 min)

---

### T1.11 — Drop `keywords` meta tag

**Why**: Google has ignored meta keywords since 2009; Bing sometimes uses it as a spam signal. Keeping it adds noise to HTML and is zero benefit.

**Files**:

- `apps/web/app/layout.tsx:43-44` — remove `keywords` from Metadata
- `apps/web/app/page.tsx:19` — remove `keywords: seoConfig.home.keywords`
- `apps/web/app/pnld/page.tsx:19` — same
- `apps/web/app/blog/[slug]/page.tsx:49` — same
- `apps/web/config/seoConfig.ts:6,15,24` — remove `keywords` fields entirely, or leave for documentation

**Implementation**:
Delete the `keywords:` Metadata key in each file. Leave keywords in seoConfig as internal reference if team wants them for content planning, but stop emitting them.

**Acceptance**:

- [ ] `<meta name="keywords">` absent from view-source on all pages
- [ ] No type errors from removed property references

**Verification**: view-source grep.

**Risk**: None.

**Effort**: S (15 min)

---

### T1.12 — WhatsApp CTAs: prefilled message text

**Why**: Every `wa.me/5541936182622` link lands the visitor in an empty WhatsApp chat. Your rep has zero context (where they came from, what service, what page). A prefilled message seeds the conversation and reduces time-to-first-useful-reply.

**Files**:

- `apps/web/content/mainContent.ts:9,69` — hero + banner CTAs
- `apps/web/content/pnldContent.ts:10,68` — hero + banner CTAs
- `apps/web/components/sections/Footer.tsx:35` — footer phone link
- `apps/web/components/sections/shared/CTASection.tsx:14-22` — the anchor

**Implementation**:
URL-encode the initial message per placement. Example:

```ts
// helper: lib/whatsapp.ts
export const WHATSAPP_NUMBER = "5541936182622";

type WhatsAppCTA = {
  message: string;
  utmCampaign?: string;
  utmContent?: string;
};

export const buildWhatsAppUrl = ({
  message,
  utmCampaign,
  utmContent,
}: WhatsAppCTA): string => {
  const params = new URLSearchParams({ text: message });
  // Note: wa.me does not forward utm params into WhatsApp chat, but we still
  // pass them here so our own click-tracking can read them client-side before
  // redirecting.
  return `https://wa.me/${WHATSAPP_NUMBER}?${params.toString()}`;
};

// usage (in content/pnldContent.ts):
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const pnldContent = {
  hero: {
    buttons: [
      {
        text: "Vamos conversar!",
        url: buildWhatsAppUrl({
          message:
            "Olá! Vim do site da Mok Labs e gostaria de adaptar um livro para o PNLD. Podemos conversar?",
          utmCampaign: "site-hero-pnld",
        }),
        variant: "primary",
      },
      // ...
    ],
  },
  // ...
};
```

Distinct messages per placement:

- `/` hero: _"Olá! Vim do site da Mok Labs e quero saber mais sobre soluções digitais para educação."_
- `/` banner: _"Olá! Pronto para tirar minha ideia do papel. Podemos conversar?"_
- `/pnld` hero: _"Olá! Vim do site da Mok Labs e quero adaptar um livro para o PNLD. Podemos conversar?"_
- `/pnld` banner: _"Olá! Pronto para começar meu projeto PNLD. Podemos conversar?"_
- Footer phone link: _"Olá! Vim do site da Mok Labs."_

**Acceptance**:

- [ ] Each placement has a unique, contextual prefilled message
- [ ] Clicking the CTA on mobile opens WhatsApp with message pre-typed in input
- [ ] Clicking on desktop opens web.whatsapp.com with same prefill

**Verification**: manual test each CTA on iOS + Android + desktop Chrome.

**Risk**: WhatsApp silently drops messages >1024 chars; keep under 400 to be safe.

**Effort**: S (1–1.5h)

---

### T1.13 — WhatsApp CTAs: PostHog click events

**Why**: Currently zero visibility into the WhatsApp branch. The contact form is instrumented (`lead_form_viewed`, `lead_submitted`, `lead_form_submit_clicked`) but WhatsApp clicks — probably the majority of conversions for a BR audience — are invisible.

**Files**:

- New component: `apps/web/components/common/WhatsAppLink.tsx` (wraps `<a>` with PostHog event)
- Update CTAs in hero components + CTA section + Footer to use it

**Implementation**:

```tsx
// components/common/WhatsAppLink.tsx
"use client";
import posthog from "posthog-js";
import { flattenAttribution, getAttribution } from "@/lib/attribution";

interface Props {
  href: string;
  cta: string; // "hero" | "banner" | "footer-phone" | ...
  page?: string; // e.g. "/" | "/pnld" | blog slug
  children: React.ReactNode;
  className?: string;
}

export const WhatsAppLink = ({
  href,
  cta,
  page,
  children,
  className,
}: Props) => {
  const handleClick = () => {
    if (typeof window === "undefined" || !posthog.__loaded) return;
    const attribution = getAttribution();
    posthog.capture("whatsapp_click", {
      cta,
      page: page ?? window.location.pathname,
      ...flattenAttribution(attribution),
    });
  };
  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
};
```

Replace raw `<a href="wa.me/...">` in:

- `HeroSectionMain.tsx:59-67`
- `HeroSectionPnld.tsx` (if it renders CTAs; in current code CTAs appear in main hero; PNLD hero just has title + image — but `/pnld` `HeroSectionPnld` doesn't render buttons. Buttons come from the hero.buttons array used by HeroSectionMain pattern — verify and update whichever hero component for /pnld renders them)
- `CTASection.tsx:14-22`
- `Footer.tsx:35`

**Note on current code**: `HeroSectionPnld` in `components/sections/shared/HeroSectionPnld.tsx` doesn't render buttons from `content.buttons` — only renders title + subtitle + image. This is a **pre-existing bug** — the `pnldContent.hero.buttons` array is declared but never rendered. Fix that too in this task: add button rendering to `HeroSectionPnld`, wrapped with `WhatsAppLink`.

**Acceptance**:

- [ ] Every WhatsApp link on the marketing site (`/`, `/pnld`, footer, CTA banner) fires `whatsapp_click` event
- [ ] Event properties include `cta`, `page`, and flattened attribution (utm_source, utm_campaign, etc.)
- [ ] PostHog event appears in live events view within 1 min of click
- [ ] `HeroSectionPnld` renders the buttons array correctly (regression fix)

**Verification**:

1. Open PostHog → Events → filter `whatsapp_click`
2. Visit preview URL with `?utm_source=test&utm_campaign=sprint1`
3. Click each WhatsApp CTA (hero, banner, footer)
4. Confirm event fires with correct `cta` and propagated UTM

**Risk**: If the page uses a plain `<Link>` for internal anchors but `<a>` for externals (mixed pattern), need to be precise which one we're replacing. **Mitigation**: search `wa.me` repo-wide and hit each.

**Effort**: M (2–3h including the HeroSectionPnld button regression fix)

---

### T1.14 — WhatsApp CTAs: UTM passthrough

**Why**: WhatsApp itself strips query params off `wa.me` URLs, so we cannot pass UTMs into the chat session. But we _can_ read the current page's UTMs, append to the outgoing prefilled message so the rep sees source inline. And we capture them in the PostHog `whatsapp_click` event (T1.13) for offline reporting.

**Files**: same as T1.12/T1.13

**Implementation**:
Extend `buildWhatsAppUrl` (or the `WhatsAppLink` component wrapper) to read current URL's UTM params client-side at click time and append a short source hint to the message:

```ts
// in WhatsAppLink, compute href at click time:
const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  const attribution = getAttribution();
  const source = attribution.last?.utm_source;
  const suffix = source ? ` (via ${source})` : "";
  const finalMessage = `${baseMessage}${suffix}`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(finalMessage)}`;

  posthog.capture("whatsapp_click", {
    /* ... */
  });
  window.open(url, "_blank", "noopener,noreferrer");
};
```

**Acceptance**:

- [ ] Visitor arriving via `?utm_source=google&utm_campaign=pnld-q2` clicks hero WhatsApp CTA → message in WhatsApp contains `(via google)`
- [ ] Visitor arriving without UTMs gets the base message (no suffix)

**Verification**:

1. Preview URL: `?utm_source=test`
2. Click WhatsApp CTA → confirm `(via test)` appears in the pre-typed message

**Risk**: Suffix-building must survive URL encoding; test once per rollout. Keep UTM surfaced short (`utm_source` only; full set is in PostHog).

**Effort**: S (1h, combined with T1.13)

---

## Sprint 1 — Verification checklist

Before calling this sprint done:

- [ ] Hero image renders on `/` after deploy
- [ ] Preview Facebook Debugger, LinkedIn Post Inspector, WhatsApp thread all show PNG preview card for `/` and `/pnld`
- [ ] Contact form tab-order with VoiceOver reads every field label
- [ ] https://validator.schema.org/ validates Organization + WebSite on `/` and `/pnld`, plus FAQPage on `/` and `/pnld`, plus BreadcrumbList on blog slug
- [ ] Lighthouse SEO score on `/` and `/pnld` = 100
- [ ] Lighthouse A11y ≥ 95 on same
- [ ] `grep "keywords:" apps/web/app apps/web/config` returns only seoConfig internal reference (if kept)
- [ ] `grep SEOHead apps/web` returns zero matches
- [ ] PostHog: `whatsapp_click` events fire from each placement with correct `cta` property
- [ ] Canonical URLs identical convention across pages (no mixed trailing-slash)
- [ ] Manual smoke test: visit `/pnld?utm_source=sprint1-test`, click hero WhatsApp → verify message prefill includes `(via sprint1-test)` AND PostHog event fires with `utm_source: "sprint1-test"`

## Risks & rollback

- **Dynamic OG images** (T1.2) may not work on Vercel edge runtime; fall back to static PNGs. Low risk, zero impact on existing behavior.
- **WhatsApp click component** (T1.13) is `"use client"` — no concern; already a client page context.
- **Schema errors** (T1.5-T1.8) — if validator flags issues, rich results won't appear but page is otherwise unaffected. Roll back by removing the `<script>` tag.
- **Canonical change** (T1.9) — Google re-crawls, may see temporary ranking dip during transition. Monitor GSC for 2 weeks post-deploy.

## Metrics to watch

- Post-deploy week 1: PostHog → count `whatsapp_click` events. Set this as the new baseline for Sprint 2.
- Post-deploy week 2–4: GSC → Enhancements → FAQ / Breadcrumb / Sitelinks sections populate.
- Post-deploy week 2: social share previews render properly (confirm via manual share).

## Out of scope

- Any hero copy rewrite (Sprint 2).
- Any new lead-capture channel (Sprint 3).
- Performance optimization beyond what the bug fixes naturally achieve (Sprint 4).
- `components/pnld-chat/CompactFooter.tsx:29` WhatsApp link (authenticated chat app). Sprint 4 cleanup.
- Dynamic per-blog-post OG images via `opengraph-image.tsx` route convention. Sprint 4.
