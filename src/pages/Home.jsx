import Hero from '../components/Hero';
import Experience from '../components/Experience';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Blog from '../components/Blog';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { useActiveNav, useScrollReveal } from '../hooks/usePortfolioEffects';

export default function Home() {
  useScrollReveal();
  useActiveNav();

  return (
    <>
      <Hero />
      <Experience />
      <Projects />
      <Skills />
      <Blog />
      <Contact />
      <Footer />
    </>
  );
}
