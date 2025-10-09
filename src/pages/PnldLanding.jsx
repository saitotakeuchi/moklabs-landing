import {
  Header,
  HeroPnld,
  ProblemStatementPnld,
  ServicesPnld,
  HowWorksPnld,
  AnimatedPanelPnld,
  OurWay,
  FAQ,
  Contact,
  Footer,
} from "../components/sections";
import { pnldContent } from "../content";

const PnldLanding = () => {
  return (
    <>
      <Header />
      <main>
        <HeroPnld content={pnldContent.hero} />
        <ProblemStatementPnld content={pnldContent.problemStatement} />
        <ServicesPnld content={pnldContent.services} />
        <AnimatedPanelPnld content={pnldContent.animatedPanel} />
        <HowWorksPnld content={pnldContent.howWorks} />
        <OurWay content={pnldContent.ourWay} />
        <FAQ content={pnldContent.faq} />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default PnldLanding;