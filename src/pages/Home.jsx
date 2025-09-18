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

const Home = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemStatement />
        <Services />
        <AnimatedPanel />
        <HowWorks />
        <OurWay />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default Home;
