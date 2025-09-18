import {
  Header,
  Hero,
  ProblemStatement,
  Services,
  HowWorks,
  AnimatedPanel,
  Solutions,
  Process,
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
        <Solutions />
        <Process />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default Home;
