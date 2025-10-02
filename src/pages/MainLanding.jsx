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
import { mainContent } from "../content";

const MainLanding = () => {
  return (
    <>
      <Header />
      <main>
        <Hero content={mainContent.hero} />
        <ProblemStatement content={mainContent.problemStatement} />
        <Services content={mainContent.services} />
        <AnimatedPanel content={mainContent.animatedPanel} />
        <HowWorks content={mainContent.howWorks} />
        <OurWay content={mainContent.ourWay} />
        <FAQ content={mainContent.faq} />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default MainLanding;