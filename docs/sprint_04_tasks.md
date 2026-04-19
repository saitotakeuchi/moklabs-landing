# Sprint 4 — Polish, Growth Channels & Deep Instrumentation

**Theme**: Open retargeting channels, polish the long tail (blog CTAs, author bylines, a11y, consent), pay down performance debt.
**Wall time**: ~1 week (est. 3–5 developer-days)
**Depends on**: Sprints 1–3 shipped (pixels benefit from audiences built earlier; consent granularity matters more once pixels fire)
**Parent plan**: [LANDING_CRO_SEO_PLAN.md](./LANDING_CRO_SEO_PLAN.md)

## Why this sprint

By Sprint 4 the acquisition and conversion mechanics are in place. Sprint 4 is about:

1. **Growth multipliers** — retargeting pixels build audiences over weeks. Shipping them in Sprint 1 is premature (no content to retarget to). Shipping them in Sprint 4 means Sprints 1–3's traffic is already building a pool.
2. **Blog monetization** — blog content is topical SEO gold but currently has zero CTA. Sprint 3 built the lead magnet; Sprint 4 surfaces it in every relevant post.
3. **Long-tail polish** — E-E-A-T signals (author bylines), a11y (focus states, skip-links, consent granularity), and performance (lazy-loading, trimming client components) all compound over months.

## Outcomes

- LinkedIn Insight Tag, Meta Pixel, Google Ads conversion tracking all firing (consent-gated)
- Every blog post has inline mid-article CTA + end-of-article lead-magnet promo
- Blog posts show author name + Person schema
- Decorative SVGs lazy-load; non-interactive hero components become server components
- Cookie consent offers granular toggles (essential / analytics / marketing)
- Keyboard-visible focus, skip-to-content link, WCAG contrast audit passed
- Footer expanded with internal site-map links + LocalBusiness schema (CNPJ, address)

## Dependencies

- Marketing: retargeting creative assets (image/video ads) — not engineering work, but parallel
- Content: author profiles (Name, bio, LinkedIn) for blog posts
- Legal: updated privacy policy reflecting granular consent (if LGPD counsel recommends)

---

## Tasks

### T4.1 — LinkedIn Insight Tag via GTM (consent-gated)

**Why**: LinkedIn is the highest-value retargeting channel for B2B editora buyers (editorial coordinators, pedagogical directors, executives). Without the Insight Tag, we can't retarget website visitors on LinkedIn, can't track LinkedIn ad conversions, and can't build matched audiences.

**Files**:

- GTM container configuration (click-through, not repo)
- `apps/web/components/common/CookieConsent.tsx` — extend consent state to track "marketing" category
- `apps/web/components/common/GoogleTagManager.tsx` — consent-gate via `window.dataLayer` before GTM fires marketing tags

**Implementation**:

1. GTM container: add LinkedIn Insight Tag as a new Tag, firing on "All Pages" trigger.
2. Gate with a custom variable `marketing_consent` that reads from localStorage. GTM only fires marketing tags when `marketing_consent === "true"`.
3. Update `CookieConsent.tsx` to push consent state into dataLayer on acceptance:

```ts
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "consent_update",
  marketing_consent: true,
  analytics_consent: true,
});
```

4. Set up a LinkedIn Campaign Manager conversion rule for `lead_submitted` — fires when visitor completes contact form (hook via GTM event listener on form submit or via server-side CAPI — see T4.3).

**Acceptance**:

- [ ] LinkedIn Insight Tag loads on production for consented users only
- [ ] LinkedIn Campaign Manager → Insight Tag status = Active
- [ ] A test visit → form submit → conversion recorded in LinkedIn within 24h
- [ ] Rejecting cookies → no LinkedIn request in Network tab

**Verification**:

1. LinkedIn Campaign Manager dashboard → Account Assets → Insight Tag → status verified
2. Chrome DevTools Network tab with consent → confirm `px.linkedin.com/` request
3. Reject consent → confirm request absent

**Risk**: Misconfigured pixels fire on bounced pages and inflate reporting. Test on preview before prod.

**Effort**: M (3–4h including GTM configuration)

---

### T4.2 — Meta Pixel via GTM (consent-gated)

**Why**: Meta's audience (Instagram/Facebook) complements LinkedIn. BR audience uses Instagram heavily; a retargeting audience from site visitors enables IG story ads that convert cheap mobile traffic.

**Files**:

- GTM container (Meta Pixel tag)
- Same consent gating as T4.1

**Implementation**:
Mirror T4.1 but for Meta Pixel. Conversion event: `Lead` triggered on form submission. Use Meta Conversions API for server-side deduplication (see T4.3).

**Acceptance**:

- [ ] Meta Pixel fires on consented pageviews
- [ ] Events Manager in Meta Ads shows `PageView` + `Lead` events
- [ ] Consent-reject → pixel absent

**Effort**: M (2–3h, parallel with T4.1)

---

### T4.3 — Google Ads conversion tracking + server-side CAPI

**Why**: Ad-blockers eat 30–40% of client-side pixel fires in BR. The attribution pipeline already has a server-side PostHog event (`lead_submitted_server`) — mirror that pattern for Google Ads (Enhanced Conversions) and Meta (Conversions API).

**Files**:

- `apps/web/app/api/contact/route.ts` — extend server event dispatch to also POST to Google Ads Offline Conversions (or Enhanced Conversions) and Meta CAPI
- `apps/web/lib/conversions-server.ts` (new) — centralized server conversion dispatcher

**Implementation**:

```ts
// lib/conversions-server.ts
import crypto from "node:crypto";

const hashEmail = (email: string) =>
  crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");

export async function dispatchServerConversion({
  email,
  service,
  attribution,
  value,
}: {
  email: string;
  service: string;
  attribution: Attribution;
  value?: number;
}) {
  // Google Ads Enhanced Conversions — via Conversion API
  if (process.env.GOOGLE_ADS_CUSTOMER_ID && attribution.last?.gclid) {
    await fetch(
      "https://googleads.googleapis.com/.../customers/.../conversionUploads",
      {
        // ...
      },
    );
  }

  // Meta Conversions API
  if (process.env.META_CAPI_ACCESS_TOKEN && process.env.META_PIXEL_ID) {
    await fetch(
      `https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.META_CAPI_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              user_data: {
                em: [hashEmail(email)],
                fbc: attribution.last?.fbclid
                  ? `fb.1.${Date.now()}.${attribution.last.fbclid}`
                  : undefined,
              },
              custom_data: { content_name: service, value, currency: "BRL" },
            },
          ],
        }),
      },
    );
  }

  // LinkedIn Conversions API (optional) — similar structure
}
```

Call `dispatchServerConversion` right after `captureServerEvent` in `app/api/contact/route.ts` (and from the T3.6 lead-magnet handler).

**Acceptance**:

- [ ] Form submission → Google Ads conversion registered (if `gclid` present)
- [ ] Form submission → Meta CAPI event registered
- [ ] Event dedup IDs match between client pixel (T4.2) and server CAPI — use deterministic event IDs

**Verification**: Google Ads Conversion Tracking Diagnostics → recent conversions; Meta Events Manager → Test Events → server-side events arrive.

**Risk**: API keys / credentials management. Use Vercel env vars, never commit.

**Effort**: L (1–2 days for full implementation + credential setup)

---

### T4.4 — Blog post inline CTA component

**Why**: Blog posts have zero CTAs today. A reader finishes a 1500-word post and has no natural next action. Inline CTA mid-article + end-of-article CTA box close this gap and convert blog traffic.

**Files**:

- `apps/web/components/blog/InlineCTA.tsx` (new) — re-usable MDX component
- `apps/web/app/blog/[slug]/page.tsx:84-176` — register `InlineCTA` in `mdxComponents`
- `apps/web/content/blog/*.mdx` — insert `<InlineCTA>` at natural break points per post

**Implementation**:

```tsx
// components/blog/InlineCTA.tsx
import Link from "next/link";

interface Props {
  variant?: "lead-magnet" | "contact" | "copiloto";
  text?: string;
  cta?: string;
  url?: string;
}

export const InlineCTA = ({ variant = "contact", text, cta, url }: Props) => {
  const defaults = {
    "lead-magnet": {
      text: "Baixe gratuitamente nosso checklist técnico do PNLD 2028 e prepare seu edital com confiança.",
      cta: "Baixar checklist",
      url: "/pnld#lead-magnet",
    },
    contact: {
      text: "Precisa adaptar seu livro para o PNLD?",
      cta: "Falar com um especialista",
      url: "/pnld#contato",
    },
    copiloto: {
      text: "Tire dúvidas sobre o edital com o Copiloto PNLD — IA especializada, grátis.",
      cta: "Experimentar Copiloto",
      url: "/pnld-chat",
    },
  };
  const content = {
    ...defaults[variant],
    ...(text && { text }),
    ...(cta && { cta }),
    ...(url && { url }),
  };
  return (
    <aside className="my-8 p-6 bg-mok-green/15 border-l-4 border-mok-blue rounded-r-lg">
      <p className="text-mok-blue font-semibold mb-3">{content.text}</p>
      <Link
        href={content.url!}
        className="inline-block bg-mok-blue text-white px-6 py-2 rounded-full font-bold hover:bg-mok-blue/90 transition-colors"
      >
        {content.cta} →
      </Link>
    </aside>
  );
};
```

Register in blog slug MDX components (line 84+):

```tsx
const mdxComponents = {
  // ... existing
  InlineCTA,
} satisfies MDXComponents;
```

Then in each `.mdx` post, insert `<InlineCTA variant="lead-magnet" />` after roughly the first third, and `<InlineCTA variant="contact" />` at the end.

**Acceptance**:

- [ ] `InlineCTA` component renders in MDX with variant prop
- [ ] Each of the 4 existing blog posts has at least one CTA
- [ ] CTA click fires `blog_cta_clicked` PostHog event (wrap in a client-side click handler)
- [ ] Styling matches brand palette

**Verification**: load each blog post, confirm CTA renders at expected point, click routes correctly, PostHog event fires.

**Risk**: Reading flow interruption — 1 CTA per post is fine, 3+ is too much. Audit placements.

**Effort**: M (2–3h including content updates per post)

---

### T4.5 — End-of-article CTA box

**Why**: Separate from mid-article T4.4 — the end-of-post CTA is the "you finished reading, now convert" moment. Should be stronger and more visual than the inline CTA.

**Files**:

- `apps/web/components/blog/EndCTA.tsx` (new) — auto-rendered at end of every blog post
- `apps/web/app/blog/[slug]/page.tsx` — render `<EndCTA postTitle={post.title} />` after `<MDXRemote>` and before next/prev nav

**Implementation**: larger visual card — "Precisa adaptar seu livro para o PNLD? Fale com a Mok Labs." with two buttons (WhatsApp primary, lead magnet secondary).

Use `WhatsAppLink` from Sprint 1 with `cta: "blog-end-${post.slug}"` to get per-post conversion data.

**Acceptance**:

- [ ] Renders at end of every blog post
- [ ] Two CTAs (WhatsApp + lead magnet), both tracked with per-post identifier
- [ ] Visible in mobile + desktop

**Verification**: each blog post shows end CTA; click both CTAs, confirm events.

**Effort**: S (1–2h)

---

### T4.6 — Blog author byline + Person schema

**Why**: Google E-E-A-T (Experience, Expertise, Authoritativeness, Trust) heavily weights `Person` schema on `BlogPosting`. Current schema uses `author: { "@type": "Organization", name: "Mok Labs" }` (`app/blog/[slug]/page.tsx:196-200`). Upgrading to Person requires author profiles.

**Files**:

- `apps/web/content/authors.ts` (new) — author profiles
- `apps/web/content/blog/*.mdx` — add `author: "author-slug"` to frontmatter
- `apps/web/lib/blog.ts` — extend `getPostBySlug` to attach author data
- `apps/web/app/blog/[slug]/page.tsx` — render byline, update JSON-LD to use Person

**Implementation**:

```ts
// content/authors.ts
export const authors = {
  "diogo-takeuchi": {
    slug: "diogo-takeuchi",
    name: "Diogo Takeuchi",
    role: "Co-founder, Mok Labs",
    bio: "Especialista em soluções digitais para educação...",
    avatar: "/authors/diogo.jpg",
    linkedin: "https://linkedin.com/in/...",
    sameAs: ["https://linkedin.com/in/...", "https://github.com/..."],
  },
  // more authors
};
```

MDX frontmatter:

```yaml
---
title: "..."
author: diogo-takeuchi
date: "2025-09-01"
---
```

JSON-LD update:

```ts
const author = authors[post.author];
const jsonLd = {
  // ...
  author: author
    ? {
        "@type": "Person",
        name: author.name,
        url: author.linkedin,
        sameAs: author.sameAs,
      }
    : { "@type": "Organization", name: "Mok Labs" }, // fallback
};
```

Render byline visually — small author card with avatar + name + role under the post title.

**Acceptance**:

- [ ] All 4 existing blog posts have `author` frontmatter field
- [ ] Byline renders on blog page with avatar + name + role
- [ ] JSON-LD uses Person (not Organization) when author is present
- [ ] Google Rich Results Test validates

**Verification**: Schema validator; manual visual check.

**Risk**: None if author profiles are real. Don't invent personas.

**Effort**: M (2–3h + content work)

---

### T4.7 — Performance: lazy-load decorative assets + trim `"use client"`

**Why**: Two compounding perf wins:

1. `ServicesSection.tsx:34-63` loads three blue-star decorative SVGs with `<Image fill>` but no `loading="lazy"`. They're below-the-fold; eager loading wastes bandwidth + delays LCP.
2. `HeroSectionMain.tsx` is `"use client"` (line 1) but the code has _no_ client-only features — no state, no effects, no animations. Moving to server component strips JS from bundle.

**Files**:

- `apps/web/components/sections/shared/ServicesSection.tsx:34,45,56` — add `loading="lazy"` to each `<Image>`
- `apps/web/components/sections/shared/HeroSectionMain.tsx:1` — remove `"use client"` if possible (check for any client hooks; if only `<Link>` and `<Image>`, should be safe)
- Audit other `"use client"` components: `Contact.tsx`, `FAQ.tsx` (both use framer-motion — must stay client)
- Audit `Header.tsx` (uses `useRouter`, `useEffect` for scroll — must stay client)

**Implementation**:
For `ServicesSection.tsx` decorative stars (lines 34, 45, 56):

```tsx
<Image
  src="/services-blue-star.svg"
  alt=""
  fill
  loading="lazy" // add
  className="object-contain"
/>
```

For `HeroSectionMain.tsx`:

```tsx
// Remove "use client" directive at line 1
// Verify no React hooks remain in the component
```

If there are no `useState`, `useEffect`, `useRouter`, etc., it's a server component, JS bundle drops.

**Acceptance**:

- [ ] Lighthouse Performance mobile on `/` and `/pnld` ≥ 90 (was ≥85 target, raise the bar)
- [ ] LCP on `/pnld` < 2.5s on fast 3G simulation
- [ ] Total JS transferred reduced measurably (compare `next build` output before/after)
- [ ] No visual regression

**Verification**: `next build` bundle analyzer; Lighthouse mobile run on preview.

**Risk**: If `HeroSectionMain` uses any implicit client behavior (e.g. a child component that's client), removing the directive cascades errors. Test in dev before committing.

**Effort**: S (1–2h)

---

### T4.8 — Consent UI: granular toggles

**Why**: `CookieConsent.tsx` offers a single "Ok, entendi" button — binary accept only, no category toggles, no "reject non-essential" option. LGPD's granular-consent interpretation is increasingly enforced. Plus, marketing pixels (T4.1, T4.2) need a `marketing_consent` signal separate from `analytics_consent`.

**Files**:

- `apps/web/components/common/CookieConsent.tsx` — full UI rewrite with category toggles
- `apps/web/app/politica-de-privacidade/page.tsx` — update privacy policy text to describe categories

**Implementation**:
Categories:

- **Essenciais** (sempre ativo, não togglável): session, CSRF, consent state
- **Analíticos** (togglável): PostHog, Vercel Analytics, Google Analytics
- **Marketing** (togglável): LinkedIn Insight, Meta Pixel, Google Ads

Store as JSON in localStorage:

```ts
localStorage.setItem(
  "cookieConsent",
  JSON.stringify({
    essential: true,
    analytics: true,
    marketing: false,
    timestamp: new Date().toISOString(),
    version: "v2",
  }),
);
```

UI: inline category toggle list with "Aceitar todos" / "Rejeitar não-essenciais" / "Personalizar" buttons.

Downstream: `PostHogProvider.tsx` reads `consentState.analytics`; GTM reads `consentState.marketing` via dataLayer push.

**Acceptance**:

- [ ] Consent banner shows 3 categories with toggles (essential disabled/pre-checked)
- [ ] "Rejeitar não-essenciais" only saves essential=true
- [ ] PostHog initializes in memory-only mode when analytics=false
- [ ] GTM marketing tags blocked when marketing=false
- [ ] User can reopen consent from footer link (add "Preferências de cookies" link)

**Verification**: test each combination — accept all → all pixels fire; analytics-only → only PostHog fires; reject-non-essentials → no pixels fire, PostHog in-memory.

**Risk**: Breaking change for users who previously accepted old single-bool format. Migration: treat old `"true"` / `"accepted"` as `{analytics: true, marketing: true}` (best-good-faith interpretation), prompt re-confirmation on next visit.

**Effort**: M-L (4–8h including migration + privacy policy text update)

---

### T4.9 — Accessibility polish

**Why**: A11y is a Core Web Vitals ranking signal. Current gaps:

1. No focus-visible treatment on custom buttons (Tailwind defaults OK, but custom gradient/opacity buttons have zero visible focus).
2. No skip-to-content link.
3. No explicit color-contrast audit (brand lime green on blue — likely OK but unverified).

**Files**:

- `apps/web/components/layout/ConditionalLayout.tsx` — add skip-to-content link
- Global button styles or per-component — add `focus-visible:ring-2 focus-visible:ring-mok-green focus-visible:ring-offset-2`
- `apps/web/app/globals.css` — global `outline: none` → `focus-visible` replacement

**Implementation**:

```tsx
// ConditionalLayout.tsx inside return:
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] bg-mok-blue text-white px-4 py-2 rounded"
>
  Pular para o conteúdo principal
</a>;
{
  /* ... */
}
<main id="main-content">{children}</main>;
```

Button focus ring (Tailwind utility on each primary button):

```tsx
className =
  "... focus-visible:outline-2 focus-visible:outline-mok-green focus-visible:outline-offset-2";
```

Contrast audit: run https://webaim.org/resources/contrastchecker/ against all brand color combos. Document in doc or fix violations.

**Acceptance**:

- [ ] Skip-to-content link visible on Tab from page top
- [ ] All interactive elements show focus-visible ring on keyboard navigation
- [ ] WCAG 2.1 AA contrast pass for all text/background pairs on `/` and `/pnld`
- [ ] Lighthouse A11y score ≥ 98

**Verification**: keyboard-only navigation test; automated axe-core scan via Chrome extension.

**Effort**: M (2–3h)

---

### T4.10 — Footer expansion + LocalBusiness schema

**Why**: Footer currently has contact + privacy link only (`Footer.tsx`). Two improvements:

1. Internal footer links are free SEO equity — every marketing site links Home/Blog/Services/About/Contact from footer. Not doing so leaves link-juice unclaimed.
2. BR-specific trust signals missing: CNPJ (a publicly registered CNPJ signals legitimacy), physical address (enables LocalBusiness schema → Google Business Profile prominence).

**Files**:

- `apps/web/components/sections/Footer.tsx` — expand layout
- `apps/web/lib/seo/schemas.ts` — add `localBusinessSchema`
- `apps/web/app/layout.tsx` — inject LocalBusiness schema globally (replaces/extends Organization)

**Implementation**:

```tsx
// Footer.tsx — expand
<footer>
  <div className="grid md:grid-cols-4 gap-8 mb-8">
    {/* Column 1: Logo + tagline (as today) */}
    <div>{/* ... */}</div>

    {/* Column 2: Serviços */}
    <div>
      <h3>Serviços</h3>
      <ul>
        <li>
          <Link href="/pnld">PNLD Digital</Link>
        </li>
        <li>
          <Link href="/pnld/2028-anos-finais">PNLD 2028 Anos Finais</Link>
        </li>
        <li>
          <Link href="/pnld-chat">Copiloto PNLD</Link>
        </li>
        <li>
          <Link href="/#servicos">Todos os serviços</Link>
        </li>
      </ul>
    </div>

    {/* Column 3: Conteúdo */}
    <div>
      <h3>Conteúdo</h3>
      <ul>
        <li>
          <Link href="/blog">Blog</Link>
        </li>
        <li>
          <Link href="/#faq">Perguntas frequentes</Link>
        </li>
        <li>
          <Link href="/pnld#lead-magnet">Checklist PNLD 2028</Link>
        </li>
      </ul>
    </div>

    {/* Column 4: Contato (expanded) */}
    <div>{/* as today + add CNPJ + address */}</div>
  </div>

  {/* Bottom bar: add CNPJ */}
  <div className="border-t pt-8">
    <p>Mok Labs — CNPJ XX.XXX.XXX/0001-XX — Endereço, Cidade, Estado</p>
  </div>
</footer>
```

LocalBusiness schema:

```ts
// schemas.ts
export const localBusinessSchema: WithContext<LocalBusiness> = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://moklabs.com.br/#localbusiness",
  name: "Mok Labs",
  url: "https://moklabs.com.br",
  telephone: "+55-41-93618-2622",
  email: "contato@moklabs.com.br",
  address: {
    "@type": "PostalAddress",
    streetAddress: "...",
    addressLocality: "...",
    addressRegion: "...",
    postalCode: "...",
    addressCountry: "BR",
  },
  taxID: "XX.XXX.XXX/0001-XX", // CNPJ
  sameAs: ["https://instagram.com/moklabs"],
  openingHoursSpecification: [
    /* optional */
  ],
};
```

**Acceptance**:

- [ ] Footer has ≥4 columns with internal links
- [ ] CNPJ visible in footer
- [ ] Physical address visible (if willing to publish)
- [ ] LocalBusiness schema validates
- [ ] Mobile footer collapses gracefully

**Verification**: schema validator; visual check at 320 / 768 / 1280px.

**Risk**: Publishing physical address is a business decision — some founders prefer P.O. boxes or registered-office-only. Align with @saito before shipping.

**Effort**: M (2–3h)

---

### T4.11 — Search Console + Bing Webmaster verification

**Why**: Both are free SEO prerequisites. Without Search Console we're blind to organic performance; Bing Webmaster enables Bing SERP visibility (not zero BR traffic).

**Files**:

- `apps/web/app/layout.tsx` — add verification meta tags
- `apps/web/.env.example` — document env variables

**Implementation**:

```tsx
export const metadata: Metadata = {
  // ...
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION || "",
    },
  },
};
```

Alternatively, verify via DNS TXT record (no code change required, but requires DNS access).

**Acceptance**:

- [ ] GSC verified as property owner
- [ ] Bing Webmaster Tools verified
- [ ] Sitemap submitted to both
- [ ] Initial crawl triggered

**Verification**: GSC Dashboard → property verified. Bing Webmaster → same.

**Risk**: None.

**Effort**: S (1h including verification flows)

---

## Sprint 4 — Verification checklist

- [ ] LinkedIn Insight + Meta Pixel + Google Ads conversion all fire on consented sessions; blocked on rejected
- [ ] Server-side CAPI events for Meta and Google Ads trigger on form submission
- [ ] Every blog post has ≥1 inline CTA + end-of-post CTA; each fires a distinct `blog_cta_clicked` with post slug
- [ ] Blog posts show author byline; Person JSON-LD validates in GSC Rich Results Test
- [ ] Lighthouse Performance mobile ≥ 90 on `/`, `/pnld`, `/blog/[slug]`
- [ ] Bundle size reduction measurable from `"use client"` trimming
- [ ] Cookie consent has 3 granular categories; PostHog + pixels honor category state
- [ ] Keyboard Tab-through shows visible focus; skip-to-content link works
- [ ] Footer has 4 columns + CNPJ + address; LocalBusiness schema validates
- [ ] Google Search Console and Bing Webmaster verified + sitemap submitted

## Metrics to watch

Measure 4–6 weeks post-Sprint 4:

- **Retargeting pool size**: LinkedIn matched audience count — growing weekly
- **Retargeting-attributed leads**: leads with `utm_source = linkedin_retargeting` or `utm_source = meta_retargeting`
- **Blog → lead conversion**: `blog_cta_clicked` → `lead_magnet_requested` or `lead_submitted` (funnel)
- **GSC author-linked queries**: author name search queries appear (if author develops external presence)
- **Lighthouse perf mobile**: ≥90 on all marketing routes
- **Consent granularity**: % of users accepting marketing vs analytics vs essential-only — establishes baseline for future regulator compliance

## Risks & rollback

- **Pixels firing without consent** = LGPD violation. Test consent gating rigorously before prod.
- **Server-side conversion APIs** expect specific payload format — misformatted requests fail silently. Verify in each platform's debugger.
- **Consent UI rewrite** is the highest-risk task — test migration from old consent format, never strip existing consent.
- **Physical address publication** — irreversible once public. Confirm with @saito.

## Out of scope

- A/B test framework setup (deferred — need more traffic)
- Next retargeting channels (TikTok, X, YouTube)
- Multi-language (not planned per BR-only positioning)
- Newsletter email program (requires separate email infrastructure — consider for Sprint 5+)
- Case study PDF generation (may follow from T3.1 case studies)

## After Sprint 4

Sprint 5+ roadmap (not detailed yet — revisit based on Sprint 4 outcomes):

- A/B test framework (PostHog Experiments) once traffic volume justifies it
- Newsletter program (captures top-of-funnel, nurtures before hand-raise)
- Expanded per-edital landing pages (2025, 2026, literário, ensino médio)
- Case study detail pages with individual URL + schema
- Regional/city-specific landing pages (São Paulo, Rio, BH) if LocalBusiness strategy pays off
- CRM integration (HubSpot / Pipedrive) for lifecycle automation
