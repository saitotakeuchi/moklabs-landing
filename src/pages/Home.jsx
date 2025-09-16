import {
  Header,
  Hero,
  ProblemStatement,
  Services,
  Solutions,
  Process,
  FAQ,
  Contact,
  Footer
} from '../components/sections';

const Home = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemStatement />
        <Services />
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