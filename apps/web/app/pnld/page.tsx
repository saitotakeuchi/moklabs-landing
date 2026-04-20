import type { Metadata } from "next";
import { Contact, FAQ } from "@/components/sections";
import {
  HeroSectionPnld,
  ProblemStatementSectionPnld,
  ServicesSectionPnld,
  HowWorksSectionPnld,
  CTASection,
  AnimatedPanelSectionPnld,
  OurWaySection,
  BlogSectionList,
} from "@/components/sections/shared";
import { SectionTracker } from "@/components/common";
import { SECTION } from "@/lib/posthog/sections";
import { pnldContent } from "@/content";
import { seoConfig } from "@/config/seoConfig";
import { buildFAQSchema, pnldServiceSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: seoConfig.pnld.title,
  description: seoConfig.pnld.description,
  openGraph: {
    title: seoConfig.pnld.title,
    description: seoConfig.pnld.description,
    url: seoConfig.pnld.url,
    images: [seoConfig.pnld.image],
  },
  twitter: {
    title: seoConfig.pnld.title,
    description: seoConfig.pnld.description,
    images: [seoConfig.pnld.image],
  },
  alternates: {
    canonical: seoConfig.pnld.url,
  },
};

export default function PnldPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFAQSchema(pnldContent.faq.items)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pnldServiceSchema),
        }}
      />
      <SectionTracker section={SECTION.HERO}>
        <HeroSectionPnld content={pnldContent.hero} />
      </SectionTracker>
      <SectionTracker section={SECTION.PROBLEM}>
        <ProblemStatementSectionPnld content={pnldContent.problemStatement} />
      </SectionTracker>
      <SectionTracker section={SECTION.SERVICES}>
        <ServicesSectionPnld content={pnldContent.services} />
      </SectionTracker>
      <SectionTracker section={SECTION.ANIMATED_PANEL}>
        <AnimatedPanelSectionPnld content={pnldContent.animatedPanel} />
      </SectionTracker>
      <SectionTracker section={SECTION.HOW_WORKS}>
        <HowWorksSectionPnld content={pnldContent.howWorks} />
      </SectionTracker>
      <SectionTracker section={SECTION.CTA_BANNER}>
        <CTASection
          text={pnldContent.ctaBanner.text}
          buttonText={pnldContent.ctaBanner.buttonText}
          whatsapp={pnldContent.ctaBanner.whatsapp}
        />
      </SectionTracker>
      <SectionTracker section={SECTION.OUR_WAY}>
        <OurWaySection content={pnldContent.ourWay} />
      </SectionTracker>
      <SectionTracker section={SECTION.FAQ}>
        <FAQ content={pnldContent.faq} />
      </SectionTracker>
      <SectionTracker section={SECTION.CONTACT}>
        <Contact />
      </SectionTracker>
      <SectionTracker section={SECTION.BLOG}>
        <BlogSectionList filterTag="PNLD" />
      </SectionTracker>
    </main>
  );
}
