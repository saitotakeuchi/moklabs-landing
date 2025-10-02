// Export shared section components
export { default as Header } from "./Header";
export { default as FAQ } from "./FAQ";
export { default as Contact } from "./Contact";
export { default as Footer } from "./Footer";

// Export generic prop-driven components from shared folder
export {
  HeroSection,
  ServicesSection,
  ProblemStatementSection,
  HowWorksSection,
  OurWaySection,
  AnimatedPanelSection
} from "./shared";

// For backward compatibility - export with original names
export { HeroSection as Hero } from "./shared";
export { ServicesSection as Services } from "./shared";
export { ProblemStatementSection as ProblemStatement } from "./shared";
export { HowWorksSection as HowWorks } from "./shared";
export { OurWaySection as OurWay } from "./shared";
export { AnimatedPanelSection as AnimatedPanel } from "./shared";
