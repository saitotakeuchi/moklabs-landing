# Sprint 3 — Social Proof & Lead Diversification

**Theme**: Close the two biggest strategic gaps: there's no evidence this company has shipped work (social proof), and there's only one lead-capture path (WhatsApp). This sprint adds both.
**Wall time**: 2–3 weeks; content-heavy, parallelizable
**Depends on**: Sprints 1–2 complete (needs schema infra, WhatsApp tracking baseline, pre-fill form plumbing)
**Parent plan**: [LANDING_CRO_SEO_PLAN.md](./LANDING_CRO_SEO_PLAN.md)

## Why this sprint

Two structural problems:

1. **Zero social proof anywhere.** No logos, testimonials, metrics, or case studies. For a B2B services business targeting conservative buyers (editoras make slow, deliberate purchasing decisions), this is the single biggest conversion gap. Publishers don't trust vendor copy; they trust other publishers.

2. **Single-destination funnel.** Every CTA routes to WhatsApp. There's no lower-friction path for:
   - Cold Google Ads traffic that won't WhatsApp a stranger
   - Blog readers researching but not buying yet
   - Editoras who want to evaluate asynchronously before talking
   - Anyone on desktop who doesn't want to switch to WhatsApp

Sprint 3 addresses both. It is the slowest of the four sprints because it's content-heavy, but the ROI curve is steepest — most tasks here have ≥2× conversion impact of Sprint 1–2 changes individually.

## Outcomes

- Named logos, testimonials, and real metrics visible above the fold on `/pnld` and in a dedicated section on `/`
- A downloadable lead magnet (PNLD 2028 technical checklist) with email gate, wired through the existing contact API + PostHog funnel
- Cal.com booking embedded for visitors who want to schedule a demo
- `/pnld-chat` (Copiloto PNLD) promoted as a free lead magnet — currently hidden behind a conditional header link
- At least one per-edital landing page (e.g. `/pnld/2028-anos-finais`) to capture that edital's high-intent search cluster
- `/pnld` body content thickened with technical spec section + glossary

## Dependencies

- **Marketing/Legal**: approval to name 3–5 editora clients + their logos + their quotes. This is the longest lead time — start this week, parallel to Sprints 1–2.
- **Content**: PNLD 2028 checklist PDF (design + writing). ~2-3 weeks depending on depth.
- **Sales**: define what "booked call" conversion looks like in the CRM; pick Cal.com / Calendly.
- **Engineering Sprints 1 & 2 shipped**: needed for JSON-LD schemas, form plumbing, attribution.

---

## Tasks

### T3.1 — Collect social proof assets (content task)

**Why**: Cannot ship T3.2 without real content. This is the gating task and must start first.

**Owner**: Marketing + Sales (not Engineering)

**Deliverables**:

- **Logos**: 5–8 editora clients who have granted written permission to appear on the marketing site. Get SVG + PNG versions from each editora's brand team; watermarked JPGs are unacceptable.
- **Testimonials**: 3–5 named quotes (name + role + editora). At least one should reference a specific outcome ("Our PNLD 2025 collection was approved on first submission thanks to...").
- **Metrics** (quantified, auditable): _e.g._, "N livros adaptados desde 2020", "X editoras parceiras", "Y% aprovados na primeira submissão FNDE", "Z mil páginas convertidas para EPUB3".
- **Case studies** (optional but high-leverage): 1–2 paragraph write-ups with challenge → approach → outcome → metric. Written approval required from each editora.

**Legal**: written consent is mandatory. Email + signed PDF. LGPD-grade.

**Files**:

- `apps/web/content/socialProof.ts` (new) — centralize metrics, testimonials, logo list
- `apps/web/public/clients/` (new) — logo SVGs

**Example content structure**:

```ts
// content/socialProof.ts
export const socialProof = {
  metrics: [
    { value: "+50", label: "livros didáticos adaptados" },
    { value: "+12", label: "editoras parceiras" },
    { value: "92%", label: "aprovados na 1ª submissão FNDE" },
    { value: "Desde 2020", label: "especializados em PNLD" },
  ],
  logos: [
    { name: "Editora X", src: "/clients/editora-x.svg", url: "https://..." },
    // ...
  ],
  testimonials: [
    {
      quote: "A Mok Labs nos levou do PDF ao EPUB3 aprovado em 3 semanas...",
      author: "Nome Sobrenome",
      role: "Coordenadora Editorial",
      company: "Editora X",
      avatar: "/testimonials/nome.jpg",
    },
  ],
  cases: [
    {
      title: "Editora X — PNLD 2025 Anos Iniciais aprovado na primeira",
      summary: "...",
      outcomes: [
        "8 livros adaptados em 5 semanas",
        "Aprovado FNDE sem pendências",
        "...",
      ],
      slug: "editora-x-pnld-2025",
    },
  ],
};
```

**Acceptance**:

- [ ] `content/socialProof.ts` populated with real content (not lorem ipsum)
- [ ] `public/clients/*.svg` committed with valid logos
- [ ] Written consent from each named party on file

**Effort**: L (2–3 weeks wall time for approvals; ~4 engineering hours to structure)

---

### T3.2 — Trust bar above the fold on `/pnld`

**Why**: First thing a `/pnld` visitor should see after the hero is proof. Simple horizontal metric strip with 3–4 numbers beats any marketing paragraph.

**Files**:

- `apps/web/components/sections/shared/TrustBar.tsx` (new)
- `apps/web/app/pnld/page.tsx` — insert `<TrustBar />` between `<HeroSectionPnld />` and `<ProblemStatementSectionPnld />`

**Implementation**:

```tsx
// TrustBar.tsx
import { socialProof } from "@/content";

export const TrustBar = () => (
  <section className="bg-white py-8 sm:py-12 border-y border-gray-200">
    <div className="max-w-[1184px] mx-auto px-4 sm:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 text-center">
        {socialProof.metrics.map((m) => (
          <div key={m.label}>
            <div className="text-[36px] sm:text-[48px] font-bold text-mok-blue leading-none">
              {m.value}
            </div>
            <div className="text-sm sm:text-base text-mok-blue/70 mt-2">
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
```

**Acceptance**:

- [ ] Renders directly below hero on `/pnld`
- [ ] Mobile: 2-column grid; desktop: 4-column
- [ ] Numbers come from `content/socialProof.ts`, not hardcoded

**Verification**: Lighthouse (no CLS regression), visual review at 320 / 768 / 1280px.

**Risk**: Incentive to inflate numbers — **don't**. Use metrics you can defend to a publisher asking for evidence.

**Effort**: S (1h, post-T3.1)

---

### T3.3 — Logo strip ("Confiado por editoras")

**Why**: Named-client logos are the highest-trust signal on any B2B site. Editoras recognize peer editoras.

**Files**:

- `apps/web/components/sections/shared/LogoStrip.tsx` (new)
- `apps/web/app/pnld/page.tsx` — insert below TrustBar

**Implementation**:

```tsx
// LogoStrip.tsx
import { socialProof } from "@/content";
import Image from "next/image";

export const LogoStrip = () => (
  <section className="bg-white py-8 sm:py-16">
    <div className="max-w-[1184px] mx-auto px-4 sm:px-8">
      <p className="text-center text-sm font-medium text-mok-blue/60 uppercase tracking-wider mb-8">
        Confiado por editoras que confiam em resultados
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 grayscale opacity-80 hover:opacity-100 transition-opacity">
        {socialProof.logos.map((logo) => (
          <Image
            key={logo.name}
            src={logo.src}
            alt={`Logo ${logo.name}`}
            width={140}
            height={60}
            className="h-8 sm:h-12 w-auto object-contain"
          />
        ))}
      </div>
    </div>
  </section>
);
```

**Acceptance**:

- [ ] 5–8 logos rendered with decent sizing at all breakpoints
- [ ] Alt text names each editora (SEO + a11y)
- [ ] Grayscale-on-default, color-on-hover (or brand-aligned treatment)

**Verification**: visual review; image format loading (WebP if PNGs).

**Effort**: S (1–2h, post-T3.1)

---

### T3.4 — Testimonials grid

**Why**: Named-quote testimonials with role + editora are second-most-trust signal after logos.

**Files**:

- `apps/web/components/sections/shared/TestimonialsGrid.tsx` (new)
- `apps/web/app/pnld/page.tsx` — insert between `OurWaySection` and FAQ

**Implementation**: standard 3-column grid on desktop, 1-column stacked on mobile. Each card: quote + author + role + company + (optional) avatar. Include `Review` JSON-LD schema for each testimonial.

```tsx
// Also add to lib/seo/schemas.ts
export const buildReviewsSchema = (
  testimonials: Testimonial[],
): WithContext<AggregateRating> => ({
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  itemReviewed: organizationSchema,
  ratingValue: "5", // if no formal rating system, skip AggregateRating and use Review[] attached to Service
  reviewCount: testimonials.length.toString(),
  // ...
});
```

Or emit individual `Review` entities — cleaner and more honest than a fake aggregate rating.

**Acceptance**:

- [ ] 3–5 testimonials rendered with clean card design
- [ ] `Review` JSON-LD validates (not AggregateRating unless genuinely computed)
- [ ] Avatars optional and lazy-loaded

**Effort**: M (2–3h, post-T3.1)

---

### T3.5 — Lead magnet: PNLD 2028 checklist PDF (content)

**Why**: Blog readers and cold Google Ads traffic need a low-friction path to convert. "Baixe o checklist PNLD 2028" is that path. PDF = perceived value + email capture.

**Owner**: Marketing (writing) + Design (layout) + Engineering (gate)

**Deliverables (content side)**:

- ~8–12 page PDF
- Topics: edital technical specs, EPUB3 requirements, acessibilidade WCAG, timeline expectations, common pitfalls, approval checklist
- Branded design matching landing page palette
- Clear CTA on last page back to `/pnld#contato`

**Files**:

- `apps/web/public/downloads/checklist-pnld-2028.pdf` — the PDF (protect via signed URL if needed)

**Acceptance**:

- [ ] PDF exists, ~1–3 MB, opens correctly
- [ ] Quality review: at least one PNLD editor proofs content for accuracy

**Effort**: L (content owner effort — 1–2 weeks)

---

### T3.6 — Lead magnet: email-gated download flow

**Why**: Implement the delivery mechanism. Gate the PDF behind an email capture; deliver via email (Resend) on successful submission.

**Files**:

- `apps/web/components/forms/LeadMagnetForm.tsx` (new) — lightweight single-field form (email only)
- `apps/web/app/api/lead-magnet/route.ts` (new) — POST handler
- `apps/web/components/sections/shared/LeadMagnetCTA.tsx` (new) — the visual promo block
- `apps/web/app/pnld/page.tsx` + `apps/web/app/page.tsx` — embed CTA at strategic position
- `apps/web/app/blog/[slug]/page.tsx` — embed at end of post (alternative to T4 blog CTA)

**Implementation**:
Server-side POST handler mirrors the existing `/api/contact`:

- Accept email + attribution
- Send PDF attachment (or download link) via Resend
- Fire PostHog `lead_magnet_requested` server-side event for ad-blocker immunity
- Return success

```ts
// app/api/lead-magnet/route.ts (sketch)
import { Resend } from "resend";
import { captureServerEvent } from "@/lib/posthog-server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function POST(request: NextRequest) {
  const { email, attribution } = await request.json();
  // validate email
  // send email with PDF attachment
  const pdfBuffer = await readFile(
    path.join(process.cwd(), "public/downloads/checklist-pnld-2028.pdf"),
  );
  await resend.emails.send({
    from: `Mok Labs <${process.env.FROM_EMAIL}>`,
    to: [email],
    subject: "Seu checklist PNLD 2028",
    html: `...`,
    attachments: [{ filename: "checklist-pnld-2028.pdf", content: pdfBuffer }],
  });
  await captureServerEvent({
    distinctId: email,
    event: "lead_magnet_requested",
    properties: { magnet: "pnld-2028-checklist" /* attribution */ },
  });
  return NextResponse.json({ ok: true });
}
```

Client-side: lightweight form with email + submit + confirmation ("Verifique seu e-mail em 2 min").

**Acceptance**:

- [ ] Submitting email triggers PDF-attached email delivery (test inbox receives it)
- [ ] Attribution passed through to PostHog event
- [ ] Form reuses the same error UX patterns as `ContactForm`
- [ ] Double-submission protected (spam consideration: rate-limit per IP or honeypot)

**Verification**: submit from preview, verify email arrives with PDF attached, confirm PostHog event fires.

**Risk**: Resend email size limit (currently 40MB attachments) — PDF at ~3MB is fine. If PDF grows >10MB, serve via signed URL from Supabase Storage instead of attaching.

**Effort**: M (4–6h)

---

### T3.7 — Cal.com booking integration

**Why**: Some prospects want to schedule, not message. "Agende 15 min com um especialista em PNLD" converts a subset of visitors who would never WhatsApp cold.

**Files**:

- Account setup on Cal.com (business decision: Cal.com vs. Calendly — Cal.com is cheaper and self-hostable)
- `apps/web/components/common/BookingWidget.tsx` (new) — inline embed or modal trigger
- `apps/web/app/pnld/page.tsx` — add booking CTA in CTA banner or as dedicated section

**Implementation**:

```tsx
// BookingWidget.tsx — inline embed
"use client";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export const BookingWidget = () => {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "pnld-discovery" });
      cal("ui", {
        theme: "light",
        styles: { branding: { brandColor: "#0013FF" } },
      });
    })();
  }, []);
  return (
    <Cal
      namespace="pnld-discovery"
      calLink="moklabs/pnld-discovery"
      config={{ layout: "month_view" }}
    />
  );
};
```

Or simpler: button that opens Cal.com in new tab (zero runtime cost).

Fire `booking_click` PostHog event on trigger; Cal.com webhook POSTs `booking_created` → our webhook endpoint → PostHog server event.

**Acceptance**:

- [ ] Cal.com link / widget functional
- [ ] PostHog receives `booking_click` on trigger and `booking_created` (via webhook) on confirmed booking
- [ ] Widget or link renders on `/pnld`

**Verification**: book a test meeting end-to-end; confirm both events fire.

**Risk**: Cal.com embed adds bundle weight (~30–50KB). If perf budget matters, use simple external link instead.

**Effort**: M (3–4h including webhook handler for `booking_created`)

---

### T3.8 — Promote Copiloto PNLD as free lead magnet

**Why**: `/pnld-chat` is an AI assistant for PNLD editorial work — a major differentiator. Today it's invisible: the "Copiloto" link only appears in the header on `/pnld` (`Header.tsx:139-151`). Making it visible everywhere as a free trial converts editors researching PNLD into product trials that become sales conversations.

**Files**:

- `apps/web/components/sections/Header.tsx:139-151` — show Copiloto link on all marketing routes, not just `/pnld`
- `apps/web/app/pnld/page.tsx` — add a dedicated "Experimente o Copiloto PNLD" section with screenshot + CTA
- `apps/web/content/pnldContent.ts` — add copiloto promo content
- `apps/web/components/sections/shared/CopilotoPromo.tsx` (new)

**Implementation**:

1. Remove the `pathname === "/pnld"` gate on the Copiloto link in Header (desktop + mobile menus both, lines 139-151 and 234-246).
2. Add a "Experimente o Copiloto PNLD" section (`CopilotoPromo.tsx`) between `OurWaySection` and `FAQ`. Include:
   - Headline: _"Copiloto PNLD — seu assistente de IA especializado no edital."_
   - 2–3 bullet benefits ("Tire dúvidas do edital em segundos", "Analise conformidade EPUB3", "Gere checklists automáticos")
   - Screenshot/GIF of the chat in action
   - Primary CTA: "Experimente grátis" → `/pnld-chat`
3. Fire `copiloto_cta_clicked` PostHog event.

**Acceptance**:

- [ ] Copiloto link visible in header across `/`, `/pnld`, `/blog`, etc.
- [ ] New promo section on `/pnld` renders
- [ ] CTA click fires `copiloto_cta_clicked`

**Verification**: route through each marketing page, confirm link present; click CTA, confirm event.

**Risk**: If `/pnld-chat` experience isn't production-ready for broader traffic, promote with a waitlist instead ("Entre para a lista de espera do Copiloto").

**Effort**: M (2–3h + design asset for screenshot)

---

### T3.9 — Per-edital landing page: `/pnld/2028-anos-finais`

**Why**: Each PNLD edital has its own search intent universe. "PNLD 2028 anos finais" is a high-intent query that `/pnld` (a generic page) cannot dominate. A focused per-edital page captures that intent and funnels to the same CTA.

Start with **one** page — the currently active edital. Scale later.

**Files**:

- `apps/web/app/pnld/2028-anos-finais/page.tsx` (new)
- `apps/web/content/pnldEditais.ts` (new) — per-edital content struct
- `apps/web/app/sitemap.ts` — add new route
- Reuse existing section components (`HeroSectionPnld`, `HowWorksSectionPnld`, etc.) with per-edital content

**Content structure**:

```ts
// content/pnldEditais.ts
export const pnldEditais = {
  "2028-anos-finais": {
    slug: "2028-anos-finais",
    editalName: "PNLD 2028 — Anos Finais do Ensino Fundamental",
    metaTitle: "Adaptação PNLD 2028 Anos Finais | Mok Labs",
    metaDescription:
      "Especialistas em adaptação para o PNLD 2028 Anos Finais (6º ao 9º ano). EPUB3 acessível, interatividade e conformidade total com o edital FNDE.",
    hero: {
      title:
        "Seu livro didático do PNLD 2028 Anos Finais, aprovado na primeira.",
      subtitle:
        "Adaptação digital completa para o edital 2028 — EPUB3 acessível, recursos interativos, acessibilidade WCAG 2.1 AA.",
    },
    technical: {
      // Edital-specific tech specs: deadline, supported formats, accessibility level, interactivity requirements
    },
    deadline: "Q1 2027", // inscription deadline
    // ...
  },
};
```

**Page component**:

```tsx
// app/pnld/2028-anos-finais/page.tsx
import type { Metadata } from "next";
import { pnldEditais } from "@/content/pnldEditais";
import { HeroSectionPnld /* ... */ } from "@/components/sections/shared";
// reuse existing components with new content

const edital = pnldEditais["2028-anos-finais"];

export const metadata: Metadata = {
  title: edital.metaTitle,
  description: edital.metaDescription,
  // OG image per edital if available
  alternates: { canonical: "https://moklabs.com.br/pnld/2028-anos-finais" },
};

export default function Page() {
  return <main>{/* sections with edital content */}</main>;
}
```

Add:

- Service JSON-LD specific to this edital
- Breadcrumb: Home > PNLD > 2028 Anos Finais
- Link from `/pnld` to `/pnld/2028-anos-finais` ("Veja detalhes do edital 2028 →")
- Add to sitemap with priority 0.85

**Acceptance**:

- [ ] Page renders with edital-specific title, deadline, technical details
- [ ] Service + Breadcrumb JSON-LD validates
- [ ] Sitemap includes the new URL
- [ ] Internal link from `/pnld` to the new page
- [ ] Blog post `pnld-2028-2031-anos-finais-primeiras-informacoes.mdx` links to this landing

**Verification**: Lighthouse SEO = 100 on new URL; rich results test passes; sitemap XML regenerated.

**Risk**: Duplicate content risk if `/pnld/2028-anos-finais` simply restates `/pnld`. **Mitigation**: at least 40% new content (technical spec section, edital-specific deadlines, edital-specific case studies).

**Effort**: M-L (1 engineering day + content writing ~1 day)

---

### T3.10 — Thicken `/pnld` body content

**Why**: `/pnld` is ~500 words of body copy. Google ranks in-depth service pages for high-intent commercial queries. Competitors with 1500+ words on similar topics out-rank thin pages — we need more substantive content, not filler.

**Files**:

- `apps/web/content/pnldContent.ts` — add new sections to export
- `apps/web/components/sections/shared/PnldTechnicalSpecs.tsx` (new)
- `apps/web/components/sections/shared/PnldGlossary.tsx` (new)
- `apps/web/app/pnld/page.tsx` — insert new sections

**New sections to add**:

**Section A: "O que está no edital PNLD"** — Clear breakdown of technical requirements:

- Formatos aceitos (EPUB3, HTML5, PDF/A)
- Padrões de acessibilidade (WCAG 2.1 AA, DAISY, audiodescrição)
- Interatividade mínima e recomendada
- Compatibilidade com dispositivos (Android, iOS, Chromebook, etc.)
- Metadados obrigatórios
- Certificações e validações

Render as collapsible accordion or a 2-column grid. This section alone is ~400-600 words of keyword-rich technical content.

**Section B: "Glossário PNLD"** — Definitions for long-tail SEO:

- PNLD, FNDE, MEC, Sinop, CBT
- EPUB3, OMML, MathML
- WCAG 2.1 AA, DAISY, NVDA/JAWS
- Interatividade H5P, HTML5
- "Anos Iniciais", "Anos Finais", "Ensino Médio", "Literário"

Each term gets 1–3 sentences. Target ~800 words total. Publishes as structured FAQ-style list; consider `DefinedTerm` JSON-LD.

**Implementation**: extend `pnldContent.ts` with new keyed sections; render components; update FAQ JSON-LD to include glossary terms if helpful.

**Acceptance**:

- [ ] `/pnld` page body length ≥1500 words (excluding headers/CTAs)
- [ ] Technical specs section and glossary render and are readable on mobile
- [ ] Glossary terms internally link to relevant blog posts when available
- [ ] No keyword stuffing — all content should be useful to a real PNLD editor

**Verification**: SEO tool (Ahrefs, SEMrush, or local wordcount) — body copy count; Google Rich Results Test for FAQ schema (should still pass).

**Risk**: Quality > quantity. Don't pad with filler. If content isn't useful, cut it.

**Effort**: L (1–2 days writing + 4h engineering)

---

## Sprint 3 — Verification checklist

- [ ] `/pnld` shows TrustBar metrics, LogoStrip with 5+ real logos, TestimonialsGrid with 3+ named quotes — all backed by `content/socialProof.ts`
- [ ] All named parties have signed consent on file
- [ ] Lead magnet PDF downloadable via email-gated form; PostHog tracks `lead_magnet_requested`
- [ ] Cal.com booking widget functional; test booking creates PostHog `booking_created` server event via webhook
- [ ] Copiloto PNLD link visible in header on all marketing routes; new promo section on `/pnld` renders
- [ ] `/pnld/2028-anos-finais` renders, indexed in sitemap, Service + Breadcrumb schema validates
- [ ] `/pnld` body content ≥1500 words; technical specs + glossary sections render
- [ ] Lighthouse SEO = 100 on both `/pnld` and `/pnld/2028-anos-finais`
- [ ] FAQ schema still validates after content additions

## Metrics to watch

Measure 3–4 weeks post-Sprint 3:

- **Total leads** (form + WhatsApp + lead magnet + booking): target +30% vs. end-of-Sprint-2
- **Lead magnet conversion rate** (`/pnld` pageview → `lead_magnet_requested`): target 3–8% of pageviews
- **Booking conversion rate**: target 1–3% of pageviews (lower absolute, higher intent)
- **Copiloto trial**: `copiloto_cta_clicked` volume
- **GSC impressions** on `/pnld` and `/pnld/2028-anos-finais` — target +50% vs. baseline for both
- **Page depth** on `/pnld` — should rise due to thickened content; Core Web Vitals should stay green

## Risks & rollback

- **Legal/consent** is the biggest risk. Do not ship logos or testimonials without written consent — both are trivially removable if not approved in time. Ship the _component_ with sample/anonymized content if needed, flip to real content when approvals land.
- **Lead magnet PDF** is content quality risk. A bad PDF damages brand trust more than no PDF at all. Don't ship before it passes internal review + one external PNLD editor proofread.
- **Per-edital landing page** SEO risk: thin duplicate content will be penalized. Enforce ≥40% net-new content.
- **Copiloto promotion** risk: if product isn't production-stable for broader traffic, use waitlist gate instead.
- **Cal.com embed** adds bundle weight; if perf regresses, switch to plain external link.

## Out of scope

- Retargeting pixels / paid media channels (Sprint 4)
- Blog post inline CTAs (Sprint 4 — even though lead magnet could be blog-promoted, the blog CTA _component_ is Sprint 4)
- Additional per-edital pages beyond 2028 (follow-up sprint)
- A/B testing the testimonial layout (Sprint 5+)
