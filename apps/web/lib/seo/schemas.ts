/**
 * Hand-typed JSON-LD schema builders.
 *
 * Narrow subset of schema.org types we actually emit. Skips the heavy
 * `schema-dts` package — these four shapes are stable enough to maintain inline.
 */

export const BASE_URL = "https://moklabs.com.br";

interface ContactPoint {
  "@type": "ContactPoint";
  telephone: string;
  contactType: string;
  availableLanguage: string[];
  areaServed: string;
}

interface PostalAddress {
  "@type": "PostalAddress";
  addressCountry: string;
}

interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  alternateName?: string;
  url: string;
  logo: string;
  description: string;
  contactPoint: ContactPoint;
  sameAs: string[];
  address: PostalAddress;
}

interface WebSiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  inLanguage: string;
}

interface Question {
  "@type": "Question";
  name: string;
  acceptedAnswer: {
    "@type": "Answer";
    text: string;
  };
}

interface FAQPageSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Question[];
}

interface ListItem {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}

interface BreadcrumbListSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: ListItem[];
}

export const organizationSchema: OrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MokLabs",
  alternateName: "Mok Labs",
  url: BASE_URL,
  logo: `${BASE_URL}/logo-moklabs.svg`,
  description:
    "Especialistas em soluções digitais para educação. Desenvolvemos objetos educacionais digitais, plataformas LMS, materiais para PNLD e projetos de IA aplicados à educação.",
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

export const websiteSchema: WebSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Mok Labs",
  url: BASE_URL,
  inLanguage: "pt-BR",
};

export function buildFAQSchema(
  items: ReadonlyArray<{ question: string; answer: string }>
): FAQPageSchema {
  return {
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
  };
}

export function buildBreadcrumbSchema(
  trail: ReadonlyArray<{ name: string; url: string }>
): BreadcrumbListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}
