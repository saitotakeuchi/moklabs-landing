import { useEffect } from 'react';

const SEOHead = ({
  title = 'Mok Labs - PNLD Digital Sem Complicação',
  description = 'Transformamos seus materiais em versões digitais acessíveis e em conformidade com os editais do PNLD. Soluções digitais sob medida, sem retrabalho, sem stress.',
  keywords = 'PNLD digital, livros digitais acessíveis, conversão PDF, ePUB, materiais educacionais, editais PNLD',
  image = '/og-image.svg',
  url = 'https://moklabs.com.br'
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (property, content) => {
      let element = document.querySelector(`meta[property="${property}"]`) ||
                   document.querySelector(`meta[name="${property}"]`);

      if (!element) {
        element = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          element.setAttribute('property', property);
        } else {
          element.setAttribute('name', property);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:locale', 'pt_BR');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Mok Labs",
      "url": url,
      "description": description,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+55-41-99999-9999",
        "contactType": "customer service",
        "availableLanguage": "Portuguese"
      },
      "sameAs": [
        "https://instagram.com/moklabs"
      ]
    };

    let jsonLd = document.querySelector('#structured-data');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.id = 'structured-data';
      jsonLd.type = 'application/ld+json';
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(structuredData);

  }, [title, description, keywords, image, url]);

  return null;
};

export default SEOHead;