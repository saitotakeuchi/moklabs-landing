/**
 * Site-wide configuration
 * This file contains all the configuration for the site including
 * metadata, navigation, social links, and feature flags.
 */

export const siteConfig = {
  // Basic site information
  name: "Mok Labs",
  shortName: "MokLabs",
  description:
    "Desenvolvemos soluções tecnológicas personalizadas para o setor educacional: objetos educacionais digitais, livros interativos, plataformas LMS, AVA e projetos de IA aplicados à educação.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://moklabs.com.br",
  locale: "pt-BR",
  lang: "pt-BR",

  // Company information
  company: {
    name: "Mok Labs",
    legalName: "Mok Labs Tecnologia LTDA",
    address: {
      street: "",
      city: "",
      state: "",
      country: "Brasil",
      postalCode: "",
    },
  },

  // Contact information
  contact: {
    email: "contato@moklabs.com.br",
    phone: "",
    supportEmail: "suporte@moklabs.com.br",
  },

  // Social media links
  social: {
    twitter: "",
    linkedin: "",
    facebook: "",
    instagram: "",
    github: "",
    youtube: "",
  },

  // Navigation links
  navigation: {
    main: [
      {
        label: "Home",
        href: "/",
        description: "Página principal",
      },
      {
        label: "PNLD",
        href: "/pnld",
        description: "Soluções para PNLD Digital",
      },
      {
        label: "Blog",
        href: "/blog",
        description: "Artigos e novidades",
      },
    ],
    footer: {
      company: [
        {
          label: "Sobre",
          href: "/sobre",
        },
        {
          label: "Serviços",
          href: "/servicos",
        },
        {
          label: "Contato",
          href: "/#contact",
        },
      ],
      legal: [
        {
          label: "Política de Privacidade",
          href: "/politica-de-privacidade",
        },
        {
          label: "Termos de Uso",
          href: "/termos-de-uso",
        },
      ],
      resources: [
        {
          label: "Blog",
          href: "/blog",
        },
        {
          label: "FAQ",
          href: "/#faq",
        },
      ],
    },
  },

  // SEO metadata
  metadata: {
    defaultTitle: "Mok Labs - Soluções Digitais para Educação",
    titleTemplate: "%s | Mok Labs",
    defaultDescription:
      "Desenvolvemos soluções tecnológicas personalizadas para o setor educacional: objetos educacionais digitais, livros interativos, plataformas LMS, AVA e projetos de IA aplicados à educação.",
    keywords: [
      "soluções digitais educação",
      "objetos educacionais digitais",
      "livros digitais interativos",
      "plataforma LMS personalizada",
      "AVA educacional",
      "IA para educação",
      "desenvolvimento educacional",
      "editoras digitais",
      "tecnologia educacional",
      "educação digital",
      "PNLD digital",
    ],
    authors: [
      {
        name: "Mok Labs",
        url: "https://moklabs.com.br",
      },
    ],
    creator: "Mok Labs",
    publisher: "Mok Labs",
    ogImage: "/og-image.svg",
    twitterHandle: "@moklabs",
  },

  // Theme configuration
  theme: {
    primaryColor: "#0013FF",
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
  },

  // Features flags
  features: {
    analytics:
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true" ||
      process.env.NODE_ENV === "production",
    cookieConsent:
      process.env.NEXT_PUBLIC_ENABLE_COOKIE_CONSENT === "true" ||
      process.env.NODE_ENV === "production",
    blog: true,
    newsletter: false,
    search: false,
  },

  // Analytics
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_TRACKING_ID || "",
  },

  // Business hours
  businessHours: {
    timezone: "America/Sao_Paulo",
    weekdays: "Segunda a Sexta",
    hours: "9h às 18h",
  },

  // API configuration
  api: {
    rateLimit: parseInt(process.env.API_RATE_LIMIT || "60", 10),
    corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(",") || ["*"],
  },
} as const;

// Type exports for TypeScript
export type SiteConfig = typeof siteConfig;
export type NavigationItem = (typeof siteConfig.navigation.main)[number];
export type FooterSection = keyof typeof siteConfig.navigation.footer;
