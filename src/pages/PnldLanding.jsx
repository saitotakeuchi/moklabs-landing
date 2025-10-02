import {
  Header,
  Hero,
  ProblemStatement,
  Services,
  HowWorks,
  AnimatedPanel,
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
        <Hero content={pnldContent.hero} />
        <ProblemStatement content={pnldContent.problemStatement} />
        <Services content={pnldContent.services} />
        <AnimatedPanel content={pnldContent.animatedPanel} />
        <HowWorks content={pnldContent.howWorks} />
        <OurWay content={pnldContent.ourWay} />
        <FAQ content={pnldContent.faq} />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default PnldLanding;