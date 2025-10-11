import type { Metadata } from "next";
import { Contact, FAQ } from "@/components/sections";
import {
  HeroSectionMain,
  ProblemStatementSection,
  ServicesSection,
  HowWorksSection,
  OurWaySection,
  AnimatedPanelSection,
  BlogSectionList,
} from "@/components/sections/shared";
import { mainContent } from "@/content";
import { seoConfig } from "@/config/seoConfig";

export const metadata: Metadata = {
  title: seoConfig.home.title,
  description: seoConfig.home.description,
  keywords: seoConfig.home.keywords,
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
      <HeroSectionMain content={mainContent.hero} />
      <ProblemStatementSection content={mainContent.problemStatement} />
      <ServicesSection content={mainContent.services} />
      <HowWorksSection content={mainContent.howWorks} />
      <OurWaySection content={mainContent.ourWay} />
      <AnimatedPanelSection content={mainContent.animatedPanel} />
      <FAQ content={mainContent.faq} />
      <Contact />
      <BlogSectionList />
    </main>
  );
}
