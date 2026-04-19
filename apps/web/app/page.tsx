import type { Metadata } from "next";
import { Contact, FAQ } from "@/components/sections";
import {
  HeroSectionMain,
  ProblemStatementSection,
  ServicesSection,
  HowWorksSection,
  CTASection,
  OurWaySection,
  AnimatedPanelSection,
  BlogSectionList,
} from "@/components/sections/shared";
import { SectionTracker } from "@/components/common";
import { SECTION } from "@/lib/posthog/sections";
import { mainContent } from "@/content";
import { seoConfig } from "@/config/seoConfig";
import { buildFAQSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: seoConfig.home.title,
  description: seoConfig.home.description,
  openGraph: {
    title: seoConfig.home.title,
    description: seoConfig.home.description,
    url: seoConfig.home.url,
    images: [seoConfig.home.image],
  },
  twitter: {
    title: seoConfig.home.title,
    description: seoConfig.home.description,
    images: [seoConfig.home.image],
  },
  alternates: {
    canonical: seoConfig.home.url,
  },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFAQSchema(mainContent.faq.items)),
        }}
      />
      <SectionTracker section={SECTION.HERO}>
        <HeroSectionMain content={mainContent.hero} />
      </SectionTracker>
      <SectionTracker section={SECTION.PROBLEM}>
        <ProblemStatementSection content={mainContent.problemStatement} />
      </SectionTracker>
      <SectionTracker section={SECTION.SERVICES}>
        <ServicesSection content={mainContent.services} />
      </SectionTracker>
      <SectionTracker section={SECTION.HOW_WORKS}>
        <HowWorksSection content={mainContent.howWorks} />
      </SectionTracker>
      <SectionTracker section={SECTION.CTA_BANNER}>
        <CTASection
          text={mainContent.ctaBanner.text}
          buttonText={mainContent.ctaBanner.buttonText}
          whatsapp={mainContent.ctaBanner.whatsapp}
        />
      </SectionTracker>
      <SectionTracker section={SECTION.OUR_WAY}>
        <OurWaySection content={mainContent.ourWay} />
      </SectionTracker>
      <SectionTracker section={SECTION.ANIMATED_PANEL}>
        <AnimatedPanelSection content={mainContent.animatedPanel} />
      </SectionTracker>
      <SectionTracker section={SECTION.FAQ}>
        <FAQ content={mainContent.faq} />
      </SectionTracker>
      <SectionTracker section={SECTION.CONTACT}>
        <Contact />
      </SectionTracker>
      <SectionTracker section={SECTION.BLOG}>
        <BlogSectionList />
      </SectionTracker>
    </main>
  );
}
