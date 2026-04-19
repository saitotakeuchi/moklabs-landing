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
      <HeroSectionMain content={mainContent.hero} />
      <ProblemStatementSection content={mainContent.problemStatement} />
      <ServicesSection content={mainContent.services} />
      <HowWorksSection content={mainContent.howWorks} />
      <CTASection
        text={mainContent.ctaBanner.text}
        buttonText={mainContent.ctaBanner.buttonText}
        whatsapp={mainContent.ctaBanner.whatsapp}
      />
      <OurWaySection content={mainContent.ourWay} />
      <AnimatedPanelSection content={mainContent.animatedPanel} />
      <FAQ content={mainContent.faq} />
      <Contact />
      <BlogSectionList />
    </main>
  );
}
