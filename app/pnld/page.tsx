import type { Metadata } from "next";
import { Contact, FAQ } from "@/components/sections";
import {
  HeroSectionPnld,
  ProblemStatementSectionPnld,
  ServicesSectionPnld,
  HowWorksSectionPnld,
  AnimatedPanelSectionPnld,
  OurWaySection,
  BlogSectionList,
} from "@/components/sections/shared";
import { pnldContent } from "@/content";
import { seoConfig } from "@/config/seoConfig";

export const metadata: Metadata = {
  title: seoConfig.pnld.title,
  description: seoConfig.pnld.description,
  keywords: seoConfig.pnld.keywords,
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
      <HeroSectionPnld content={pnldContent.hero} />
      <ProblemStatementSectionPnld content={pnldContent.problemStatement} />
      <ServicesSectionPnld content={pnldContent.services} />
      <AnimatedPanelSectionPnld content={pnldContent.animatedPanel} />
      <HowWorksSectionPnld content={pnldContent.howWorks} />
      <OurWaySection content={pnldContent.ourWay} />
      <FAQ content={pnldContent.faq} />
      <Contact />
      <BlogSectionList filterTag="PNLD" />
    </main>
  );
}
