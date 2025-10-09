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
        <HowWorks content={mainContent.howWorks} />
        <OurWay content={mainContent.ourWay} />
        <AnimatedPanel content={mainContent.animatedPanel} />
        <FAQ content={mainContent.faq} />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default MainLanding;
