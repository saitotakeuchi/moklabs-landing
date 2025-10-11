"use client";

import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

// NOTE: This component is deprecated in Next.js.
// Use the Metadata API in page/layout files instead.
// This is kept for backwards compatibility during migration.
const SEOHead = ({
  title = "Mok Labs - PNLD Digital Sem Complicação",
  description = "Transformamos seus materiais em versões digitais acessíveis e em conformidade com os editais do PNLD. Soluções digitais sob medida, sem retrabalho, sem stress.",
  keywords = "PNLD digital, livros digitais acessíveis, conversão PDF, ePUB, materiais educacionais, editais PNLD",
  image = "/og-image.svg",
  url = "https://moklabs.com.br",
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (property: string, content: string) => {
      let element =
        document.querySelector(`meta[property="${property}"]`) ||
        document.querySelector(`meta[name="${property}"]`);

      if (!element) {
        element = document.createElement("meta");
        if (property.startsWith("og:") || property.startsWith("twitter:")) {
          element.setAttribute("property", property);
        } else {
          element.setAttribute("name", property);
        }
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Update or create link tags (for canonical)
    const updateLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    // Basic meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);

    // Canonical URL
    updateLinkTag("canonical", url);

    // Open Graph tags
    updateMetaTag("og:title", title);
    updateMetaTag("og:description", description);
    updateMetaTag("og:image", `https://moklabs.com.br${image}`);
    updateMetaTag("og:url", url);
    updateMetaTag("og:type", "website");
    updateMetaTag("og:locale", "pt_BR");
    updateMetaTag("og:site_name", "MokLabs");

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", `https://moklabs.com.br${image}`);

    // Structured data - Organization
    const organizationData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "MokLabs",
      alternateName: "Mok Labs",
      url: "https://moklabs.com.br",
      logo: "https://moklabs.com.br/logo.svg",
      description:
        "Especialistas em soluções digitais para educação. Desenvolvemos objetos educacionais digitais, plataformas LMS, materiais para PNLD e projetos de IA aplicados à educação.",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+55-41-99269-4663",
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

    // Structured data - WebPage
    const webPageData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: description,
      url: url,
      inLanguage: "pt-BR",
      isPartOf: {
        "@type": "WebSite",
        name: "MokLabs",
        url: "https://moklabs.com.br",
      },
    };

    // Update or create structured data scripts
    let orgJsonLd = document.querySelector("#structured-data-org");
    if (!orgJsonLd) {
      orgJsonLd = document.createElement("script");
      orgJsonLd.id = "structured-data-org";
      orgJsonLd.setAttribute("type", "application/ld+json");
      document.head.appendChild(orgJsonLd);
    }
    orgJsonLd.textContent = JSON.stringify(organizationData);

    let pageJsonLd = document.querySelector("#structured-data-page");
    if (!pageJsonLd) {
      pageJsonLd = document.createElement("script");
      pageJsonLd.id = "structured-data-page";
      pageJsonLd.setAttribute("type", "application/ld+json");
      document.head.appendChild(pageJsonLd);
    }
    pageJsonLd.textContent = JSON.stringify(webPageData);
  }, [title, description, keywords, image, url]);

  return null;
};

export default SEOHead;
