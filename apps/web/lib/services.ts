/**
 * Canonical service taxonomy.
 *
 * Single source of truth for: contact form dropdown values, server-side
 * allowlist, services-section card mappings, and `?service=` query-param
 * pre-fill. Display labels (UPPERCASE marketing copy) live in the content
 * files and map back to these slugs via a `canonical` field on each item.
 *
 * Add new slugs here; never inline them elsewhere.
 */

export const SERVICE_SLUGS = [
  // Conteúdo Digital
  "Livro Digital",
  "PNLD Digital",
  "Objetos Digitais",
  "Jogos Educacionais",
  "Simuladores",
  "Conteúdo Multimídia",
  // Acessibilidade & Inclusão
  "Acessibilidade",
  "Audiodescrição",
  // Tecnologia
  "IA Aplicada à Educação",
  "Automação",
  "Interatividade",
  "Conversão EPUB3",
  // Criação
  "Ilustração",
  // Serviços
  "Consultoria",
  "Outros",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const SERVICE_GROUPS: ReadonlyArray<{
  label: string;
  slugs: ReadonlyArray<ServiceSlug>;
}> = [
  {
    label: "Conteúdo Digital",
    slugs: [
      "Livro Digital",
      "PNLD Digital",
      "Objetos Digitais",
      "Jogos Educacionais",
      "Simuladores",
      "Conteúdo Multimídia",
    ],
  },
  {
    label: "Acessibilidade & Inclusão",
    slugs: ["Acessibilidade", "Audiodescrição"],
  },
  {
    label: "Tecnologia",
    slugs: [
      "IA Aplicada à Educação",
      "Automação",
      "Interatividade",
      "Conversão EPUB3",
    ],
  },
  {
    label: "Criação",
    slugs: ["Ilustração"],
  },
  {
    label: "Serviços",
    slugs: ["Consultoria", "Outros"],
  },
];

export const isServiceSlug = (value: unknown): value is ServiceSlug =>
  typeof value === "string" &&
  (SERVICE_SLUGS as readonly string[]).includes(value);
