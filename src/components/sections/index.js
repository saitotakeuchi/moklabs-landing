// Export shared section components
export { default as Header } from "./Header";
export { default as FAQ } from "./FAQ";
export { default as Contact } from "./Contact";
export { default as Footer } from "./Footer";

// Export generic prop-driven components from shared folder
export {
  HeroSection,
  HeroSectionPnld,
  ServicesSection,
  ServicesSectionPnld,
  ProblemStatementSection,
  ProblemStatementSectionPnld,
  HowWorksSection,
  HowWorksSectionPnld,
  OurWaySection,
  AnimatedPanelSection,
  AnimatedPanelSectionPnld
} from "./shared";

// For backward compatibility - export with original names
export { HeroSection as Hero } from "./shared";
export { HeroSectionPnld as HeroPnld } from "./shared";
export { ServicesSection as Services } from "./shared";
export { ServicesSectionPnld as ServicesPnld } from "./shared";
export { ProblemStatementSection as ProblemStatement } from "./shared";
export { ProblemStatementSectionPnld as ProblemStatementPnld } from "./shared";
export { HowWorksSection as HowWorks } from "./shared";
export { HowWorksSectionPnld as HowWorksPnld } from "./shared";
export { OurWaySection as OurWay } from "./shared";
export { AnimatedPanelSection as AnimatedPanel } from "./shared";
export { AnimatedPanelSectionPnld as AnimatedPanelPnld } from "./shared";
